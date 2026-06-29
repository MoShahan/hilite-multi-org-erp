import { ActivityType } from "../generated/prisma/client";
import { buildActorSnapshot } from "../lib/auditHelpers";
import { eventBus } from "../lib/eventBus";
import {
  activityRepository,
  type ActivityRecord,
} from "../repositories/activity.repository";
import { leadRepository } from "../repositories/lead.repository";
import { auditService } from "../services/audit.service";
import { AppError } from "../utils/AppError";

import {
  assertCanCreateActivity,
  assertCanReadLead,
} from "./leadAccess.service";

import type {
  ActivityResponse,
  CreateActivityInput,
  ListActivitiesQuery,
  PaginatedActivitiesResponse,
  ParsedListActivitiesQuery,
} from "../types/activity";
import type { AuditMutationContext } from "../types/audit";
import type { AuthUser } from "../types/auth";


const DEFAULT_LIST_QUERY = {
  page: 1,
  pageSize: 20,
};

const ACTIVITY_TYPES = Object.values(ActivityType);

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
): ParsedListActivitiesQuery => ({
  page: parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page),
  pageSize: Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  ),
});

const toActivityResponse = (activity: ActivityRecord): ActivityResponse => ({
  id: activity.id,
  type: activity.type,
  notes: activity.notes,
  createdBy: activity.createdBy,
  createdAt: activity.createdAt.toISOString(),
});

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

export const activityService = {
  listActivities: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedActivitiesResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const lead = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!lead) {
      throw AppError.notFound("Lead not found");
    }

    assertCanReadLead(lead, authUser, orgId);

    const query = parseListQuery(rawQuery);
    const { activities, total } = await activityRepository.findManyPaginated(
      leadId,
      query,
    );

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      activities: activities.map(toActivityResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  createActivity: async (
    organizationId: string | null,
    authUser: AuthUser,
    leadId: string,
    input: CreateActivityInput,
    auditContext?: AuditMutationContext,
  ): Promise<ActivityResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const lead = await leadRepository.findByIdForOrganization(leadId, orgId);

    if (!lead) {
      throw AppError.notFound("Lead not found");
    }

    assertCanReadLead(lead, authUser, orgId);
    assertCanCreateActivity(lead, authUser);

    const notes = input.notes?.trim();

    if (!notes) {
      throw AppError.badRequest("Notes are required", [
        { field: "notes", message: "Notes are required" },
      ]);
    }

    if (!input.type || !ACTIVITY_TYPES.includes(input.type)) {
      throw AppError.badRequest("Activity type is invalid", [
        { field: "type", message: "Activity type is invalid" },
      ]);
    }

    const activity = await activityRepository.create({
      leadId,
      type: input.type,
      notes,
      createdById: authUser.id,
    });

    eventBus.emit("ACTIVITY_LOGGED", {
      organizationId: orgId,
      leadId: lead.id,
      leadName: lead.name,
      teamId: lead.teamId,
      actorId: authUser.id,
      actorName: authUser.name,
      activityType: input.type,
    });

    auditService.log({
      organizationId: orgId,
      actorId: authUser.id,
      action: "ACTIVITY_LOGGED",
      entityType: "activity",
      entityId: activity.id,
      metadata: {
        summary: `Activity logged (${input.type}) on ${lead.name}`,
        actor: buildActorSnapshot(auditContext?.authUser ?? authUser),
        after: { type: input.type, notes },
        related: {
          lead: { id: lead.id, name: lead.name },
          team: { id: lead.team.id, name: lead.team.name },
        },
      },
      requestContext: auditContext?.requestContext,
    });

    return toActivityResponse(activity);
  },
};

export type { ListActivitiesQuery };
