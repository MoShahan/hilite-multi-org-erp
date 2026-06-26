import { LeadStatus } from "../generated/prisma/client";
import { assertValidStatusTransition } from "../constants/leadStatusPipeline";
import { eventBus } from "../lib/eventBus";
import { buildActorSnapshot, buildChangeSet } from "../lib/auditHelpers";
import { buildLeadStatusHistory } from "../lib/leadStatusHistory";
import { parseOptionalEmail } from "../lib/email";
import { parseRequiredPhoneNumber } from "../lib/phoneNumber";
import { leadRepository, type LeadRecord } from "../repositories/lead.repository";
import { auditRepository } from "../repositories/audit.repository";
import { auditService } from "../services/audit.service";
import type { AuditMutationContext } from "../types/audit";
import type {
  AssignLeadInput,
  CreateLeadInput,
  ListLeadsQuery,
  PaginatedLeadsResponse,
  ParsedListLeadsQuery,
  LeadListSortBy,
  LeadListSortOrder,
  LeadListStatusFilter,
  LeadResponse,
  LeadStatusHistoryResponse,
  UpdateLeadInput,
} from "../types/lead";
import { AppError } from "../utils/AppError";
import {
  assertAssigneeEligible,
  assertCanReadLead,
  assertCanReassignLead,
  assertCanUpdateLeadStatus,
  assertCanWriteLead,
  resolveCreateTeamId,
  resolveLeadListScope,
} from "./leadAccess.service";
import type { AuthUser } from "../types/auth";

const DEFAULT_LIST_QUERY = {
  status: "ALL" as LeadListStatusFilter,
  sortBy: "createdAt" as LeadListSortBy,
  sortOrder: "desc" as LeadListSortOrder,
  page: 1,
  pageSize: 10,
};

const SORT_BY_VALUES: LeadListSortBy[] = [
  "name",
  "status",
  "team",
  "assignee",
  "createdAt",
];

const SORT_ORDER_VALUES: LeadListSortOrder[] = ["asc", "desc"];

const STATUS_FILTER_VALUES: LeadListStatusFilter[] = [
  "ALL",
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.NEGOTIATION,
  LeadStatus.WON,
  LeadStatus.LOST,
  LeadStatus.SITE_VISIT_COMPLETED,
  LeadStatus.VISIT_SCHEDULED,
];

const parseQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(parseQueryValue(value) ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseListQuery = (
  rawQuery: Record<string, unknown>,
): ParsedListLeadsQuery => {
  const search = parseQueryValue(rawQuery.search)?.trim();
  const statusRaw = parseQueryValue(rawQuery.status)?.toUpperCase();
  const sortByRaw = parseQueryValue(rawQuery.sortBy);
  const sortOrderRaw = parseQueryValue(rawQuery.sortOrder)?.toLowerCase();
  const teamId = parseQueryValue(rawQuery.teamId);
  const assignedToIdRaw = parseQueryValue(rawQuery.assignedToId);

  const status = STATUS_FILTER_VALUES.includes(
    statusRaw as LeadListStatusFilter,
  )
    ? (statusRaw as LeadListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as LeadListSortBy)
    ? (sortByRaw as LeadListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as LeadListSortOrder,
  )
    ? (sortOrderRaw as LeadListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page);
  const pageSize = Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  );

  const assignedToUnassigned = assignedToIdRaw === "unassigned";
  const assignedToId =
    assignedToIdRaw && assignedToIdRaw !== "unassigned"
      ? assignedToIdRaw
      : undefined;

  return {
    search: search || undefined,
    status,
    teamId: teamId || undefined,
    assignedToId,
    assignedToUnassigned,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

const toLeadResponse = (lead: LeadRecord): LeadResponse => ({
  id: lead.id,
  name: lead.name,
  mobileNumber: lead.mobileNumber,
  email: lead.email,
  source: lead.source,
  project: lead.project,
  status: lead.status,
  team: lead.team,
  assignedTo: lead.assignedTo,
  createdBy: lead.createdBy,
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString(),
});

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

const optionalString = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const leadSnapshot = (lead: LeadRecord) => ({
  name: lead.name,
  mobileNumber: lead.mobileNumber,
  email: lead.email,
  source: lead.source,
  project: lead.project,
  status: lead.status,
});

const toAssigneeRef = (user: LeadRecord["assignedTo"]) =>
  user
    ? { id: user.id, name: user.name, email: user.email }
    : undefined;

export const leadService = {
  listLeads: async (
    organizationId: string | null,
    authUser: AuthUser,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedLeadsResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const scope = resolveLeadListScope(authUser, orgId);
    const query = parseListQuery(rawQuery);
    const { leads, total } = await leadRepository.findManyPaginated(
      scope,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      leads: leads.map(toLeadResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  getLead: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
  ): Promise<LeadResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const lead = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!lead) {
      throw AppError.notFound("Lead not found");
    }

    assertCanReadLead(lead, authUser, orgId);
    return toLeadResponse(lead);
  },

  createLead: async (
    organizationId: string | null,
    authUser: AuthUser,
    input: CreateLeadInput,
    auditContext?: AuditMutationContext,
  ): Promise<LeadResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const name = input.name?.trim();

    if (!name) {
      throw AppError.badRequest("Name is required", [
        { field: "name", message: "Name is required" },
      ]);
    }

    const teamId = resolveCreateTeamId(authUser, input.teamId);
    const team = await leadRepository.findTeamInOrganization(teamId, orgId);

    if (!team) {
      throw AppError.badRequest("Team is invalid", [
        { field: "teamId", message: "Team is invalid" },
      ]);
    }

    if (input.assignedToId) {
      await assertAssigneeEligible(input.assignedToId, teamId, orgId);
    }

    const lead = await leadRepository.create({
      organizationId: orgId,
      teamId,
      assignedToId: input.assignedToId ?? null,
      name,
      mobileNumber: parseRequiredPhoneNumber(input.mobileNumber),
      email: parseOptionalEmail(input.email),
      source: optionalString(input.source),
      project: optionalString(input.project),
      createdById: authUser.id,
    });

    const assignedToId = input.assignedToId ?? null;

    if (!assignedToId) {
      eventBus.emit("LEAD_CREATED", {
        organizationId: orgId,
        leadId: lead.id,
        leadName: lead.name,
        teamId,
        actorId: authUser.id,
      });
    } else if (assignedToId !== authUser.id) {
      eventBus.emit("LEAD_ASSIGNED", {
        organizationId: orgId,
        leadId: lead.id,
        leadName: lead.name,
        teamId,
        actorId: authUser.id,
        assigneeId: assignedToId,
      });
    }

    const actor = buildActorSnapshot(auditContext?.authUser ?? authUser);

    auditService.log({
      organizationId: orgId,
      actorId: authUser.id,
      action: "LEAD_CREATED",
      entityType: "lead",
      entityId: lead.id,
      metadata: {
        summary: `Lead created: ${lead.name}`,
        actor,
        after: leadSnapshot(lead),
        related: {
          lead: { id: lead.id, name: lead.name },
          team: { id: lead.team.id, name: lead.team.name },
          assignee: toAssigneeRef(lead.assignedTo),
        },
      },
      requestContext: auditContext?.requestContext,
    });

    if (assignedToId && lead.assignedTo) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_ASSIGNED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead assigned to ${lead.assignedTo.name}: ${lead.name}`,
          actor,
          related: {
            lead: { id: lead.id, name: lead.name },
            team: { id: lead.team.id, name: lead.team.name },
            assignee: toAssigneeRef(lead.assignedTo),
          },
        },
        requestContext: auditContext?.requestContext,
      });
    }

    return toLeadResponse(lead);
  },

  updateLead: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
    input: UpdateLeadInput,
    auditContext?: AuditMutationContext,
  ): Promise<LeadResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const existing = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!existing) {
      throw AppError.notFound("Lead not found");
    }

    const definedKeys = (Object.keys(input) as (keyof UpdateLeadInput)[]).filter(
      (key) => input[key] !== undefined,
    );

    if (definedKeys.length === 0) {
      throw AppError.badRequest("No fields to update");
    }

    const hasStatus = input.status !== undefined;
    const hasNonStatusFields = definedKeys.some((key) => key !== "status");

    if (hasNonStatusFields) {
      assertCanWriteLead(existing, authUser, orgId);
    } else if (hasStatus) {
      assertCanUpdateLeadStatus(existing, authUser, orgId);
    } else {
      throw AppError.badRequest("No fields to update");
    }

    const name = input.name !== undefined ? input.name.trim() : undefined;

    if (name !== undefined && !name) {
      throw AppError.badRequest("Name is required", [
        { field: "name", message: "Name is required" },
      ]);
    }

    if (input.status && !Object.values(LeadStatus).includes(input.status)) {
      throw AppError.badRequest("Invalid lead status");
    }

    if (
      input.status !== undefined &&
      input.status !== existing.status
    ) {
      assertValidStatusTransition(existing.status, input.status);
    }

    const lead = await leadRepository.update(leadId, {
      ...(name !== undefined ? { name } : {}),
      ...(input.mobileNumber !== undefined
        ? { mobileNumber: parseRequiredPhoneNumber(input.mobileNumber) }
        : {}),
      ...(input.email !== undefined
        ? { email: parseOptionalEmail(input.email) }
        : {}),
      ...(input.source !== undefined
        ? { source: optionalString(input.source ?? undefined) }
        : {}),
      ...(input.project !== undefined
        ? { project: optionalString(input.project ?? undefined) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    if (
      input.status !== undefined &&
      input.status !== existing.status &&
      existing.assignedToId
    ) {
      eventBus.emit("LEAD_STATUS_CHANGED", {
        organizationId: orgId,
        leadId: lead.id,
        leadName: lead.name,
        teamId: existing.teamId,
        actorId: authUser.id,
        assigneeId: existing.assignedToId,
        status: input.status,
        previousStatus: existing.status,
      });
    }

    const actor = buildActorSnapshot(auditContext?.authUser ?? authUser);
    const before = leadSnapshot(existing);
    const after = leadSnapshot(lead);
    const fieldChanges = buildChangeSet(before, after, [
      "name",
      "mobileNumber",
      "email",
      "source",
      "project",
    ]);

    if (fieldChanges.changedFields.length > 0) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_UPDATED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead updated: ${lead.name}`,
          actor,
          before: fieldChanges.before,
          after: fieldChanges.after,
          changedFields: fieldChanges.changedFields,
          related: {
            lead: { id: lead.id, name: lead.name },
            team: { id: lead.team.id, name: lead.team.name },
            assignee: toAssigneeRef(lead.assignedTo),
          },
        },
        requestContext: auditContext?.requestContext,
      });
    }

    if (input.status !== undefined && input.status !== existing.status) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_STATUS_CHANGED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead status changed from ${existing.status} to ${input.status}: ${lead.name}`,
          actor,
          before: { status: existing.status },
          after: { status: input.status },
          changedFields: ["status"],
          related: {
            lead: { id: lead.id, name: lead.name },
            assignee: toAssigneeRef(lead.assignedTo),
          },
        },
        requestContext: auditContext?.requestContext,
      });
    }

    return toLeadResponse(lead);
  },

  listStatusHistory: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
  ): Promise<LeadStatusHistoryResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const lead = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!lead) {
      throw AppError.notFound("Lead not found");
    }

    assertCanReadLead(lead, authUser, orgId);

    const auditLogs = await auditRepository.findForEntityActions(
      orgId,
      "lead",
      leadId,
      ["LEAD_CREATED", "LEAD_STATUS_CHANGED"],
    );

    return buildLeadStatusHistory(lead, auditLogs);
  },

  assignLead: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
    input: AssignLeadInput,
    auditContext?: AuditMutationContext,
  ): Promise<LeadResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const existing = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!existing) {
      throw AppError.notFound("Lead not found");
    }

    assertCanReassignLead(existing, authUser, orgId);

    if (input.assignedToId) {
      await assertAssigneeEligible(
        input.assignedToId,
        existing.teamId,
        orgId,
      );
    }

    const previousAssigneeId = existing.assignedToId;
    const newAssigneeId = input.assignedToId;

    const lead = await leadRepository.assign(leadId, input.assignedToId);

    if (
      previousAssigneeId &&
      previousAssigneeId !== newAssigneeId &&
      previousAssigneeId !== authUser.id
    ) {
      eventBus.emit("LEAD_REASSIGNED", {
        organizationId: orgId,
        leadId: lead.id,
        leadName: lead.name,
        teamId: existing.teamId,
        actorId: authUser.id,
        previousAssigneeId,
      });
    }

    if (
      newAssigneeId &&
      newAssigneeId !== previousAssigneeId &&
      newAssigneeId !== authUser.id
    ) {
      eventBus.emit("LEAD_ASSIGNED", {
        organizationId: orgId,
        leadId: lead.id,
        leadName: lead.name,
        teamId: existing.teamId,
        actorId: authUser.id,
        assigneeId: newAssigneeId,
      });
    }

    const actor = buildActorSnapshot(auditContext?.authUser ?? authUser);

    if (!newAssigneeId && previousAssigneeId) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_UNASSIGNED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead unassigned: ${lead.name}`,
          actor,
          related: {
            lead: { id: lead.id, name: lead.name },
            previousAssignee: toAssigneeRef(existing.assignedTo),
            team: { id: lead.team.id, name: lead.team.name },
          },
        },
        requestContext: auditContext?.requestContext,
      });
    } else if (
      previousAssigneeId &&
      newAssigneeId &&
      previousAssigneeId !== newAssigneeId
    ) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_REASSIGNED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead reassigned to ${lead.assignedTo?.name ?? "user"}: ${lead.name}`,
          actor,
          related: {
            lead: { id: lead.id, name: lead.name },
            previousAssignee: toAssigneeRef(existing.assignedTo),
            assignee: toAssigneeRef(lead.assignedTo),
            team: { id: lead.team.id, name: lead.team.name },
          },
        },
        requestContext: auditContext?.requestContext,
      });
    } else if (newAssigneeId && !previousAssigneeId) {
      auditService.log({
        organizationId: orgId,
        actorId: authUser.id,
        action: "LEAD_ASSIGNED",
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          summary: `Lead assigned to ${lead.assignedTo?.name ?? "user"}: ${lead.name}`,
          actor,
          related: {
            lead: { id: lead.id, name: lead.name },
            assignee: toAssigneeRef(lead.assignedTo),
            team: { id: lead.team.id, name: lead.team.name },
          },
        },
        requestContext: auditContext?.requestContext,
      });
    }

    return toLeadResponse(lead);
  },
};

export type { ListLeadsQuery };
