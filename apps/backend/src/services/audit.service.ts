import {
  buildSummary,
  mergeRequestContext,
} from "../lib/auditHelpers";
import { logger } from "../lib/logger";
import {
  auditRepository,
  type AuditLogRecord,
} from "../repositories/audit.repository";
import { AppError } from "../utils/AppError";

import type { AuditAction } from "../generated/prisma/client";
import type {
  AuditEntityType,
  AuditLogResponse,
  AuditMetadata,
  CreateAuditLogInput,
  ListAuditLogsQuery,
  PaginatedAuditLogsResponse,
  ParsedListAuditLogsQuery,
} from "../types/audit";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const AUDIT_ACTIONS = new Set<string>([
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "AUTH_LOGOUT",
  "AUTH_TOKEN_REFRESHED",
  "AUTH_TOKEN_REFRESH_FAILED",
  "AUTH_SESSION_REVOKED",
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_STATUS_CHANGED",
  "LEAD_ASSIGNED",
  "LEAD_REASSIGNED",
  "LEAD_UNASSIGNED",
  "ACTIVITY_LOGGED",
  "USER_CREATED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "TEAM_CREATED",
  "TEAM_MEMBER_ADDED",
  "ROLE_CREATED",
  "ROLE_UPDATED",
  "ROLE_DELETED",
  "ORG_CREATED",
  "ORG_UPDATED",
  "ORG_STATUS_CHANGED",
  "ORG_MODULES_UPDATED",
]);

const ENTITY_TYPES = new Set<string>([
  "auth",
  "lead",
  "activity",
  "user",
  "team",
  "role",
  "organization",
]);

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

const parseDate = (value: unknown): Date | undefined => {
  const raw = parseQueryValue(value);

  if (!raw) {
    return undefined;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const parseListQuery = (
  rawQuery: Record<string, unknown>,
): ParsedListAuditLogsQuery => {
  const actionRaw = parseQueryValue(rawQuery.action);
  const entityTypeRaw = parseQueryValue(rawQuery.entityType);
  const pageSize = Math.min(
    parsePositiveInt(rawQuery.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  return {
    page: parsePositiveInt(rawQuery.page, DEFAULT_PAGE),
    pageSize,
    action:
      actionRaw && AUDIT_ACTIONS.has(actionRaw)
        ? (actionRaw as AuditAction)
        : undefined,
    actorId: parseQueryValue(rawQuery.actorId),
    entityType:
      entityTypeRaw && ENTITY_TYPES.has(entityTypeRaw)
        ? (entityTypeRaw as AuditEntityType)
        : undefined,
    entityId: parseQueryValue(rawQuery.entityId),
    organizationId: parseQueryValue(rawQuery.organizationId),
    from: parseDate(rawQuery.from),
    to: parseDate(rawQuery.to),
    search: parseQueryValue(rawQuery.search)?.trim(),
  };
};

const toAuditLogResponse = (record: AuditLogRecord): AuditLogResponse => {
  const metadata = (record.metadata ?? {}) as AuditMetadata;

  return {
    id: record.id,
    organizationId: record.organizationId,
    organization: record.organization
      ? {
          id: record.organization.id,
          name: record.organization.name,
          code: record.organization.code,
        }
      : metadata.organization ?? null,
    actorId: record.actorId,
    actor: record.actor
      ? {
          id: record.actor.id,
          name: record.actor.name,
          email: record.actor.email,
          roleSlug: record.actor.userRole?.role.slug ?? null,
        }
      : metadata.actor ?? null,
    action: record.action,
    entityType: record.entityType as AuditEntityType,
    entityId: record.entityId,
    metadata,
    createdAt: record.createdAt.toISOString(),
  };
};

export const auditService = {
  log: (input: CreateAuditLogInput): void => {
    const metadata = mergeRequestContext(
      {
        ...input.metadata,
        summary: buildSummary(input.action, input.metadata),
      },
      input.requestContext,
    );

    void auditRepository
      .create({
        ...input,
        metadata,
      })
      .catch((error) => {
        logger.error("Failed to write audit log", {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          error,
        });
      });
  },

  listForOrg: async (
    organizationId: string,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedAuditLogsResponse> => {
    const query = parseListQuery(rawQuery);
    const { auditLogs, total } = await auditRepository.findPaginated(
      query,
      organizationId,
    );
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      auditLogs: auditLogs.map(toAuditLogResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  listForPlatform: async (
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedAuditLogsResponse> => {
    const query = parseListQuery(rawQuery);
    const { auditLogs, total } = await auditRepository.findPaginated(query);
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      auditLogs: auditLogs.map(toAuditLogResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  requireOrganizationId: (organizationId: string | null | undefined): string => {
    if (!organizationId) {
      throw AppError.forbidden("Organization context is required");
    }

    return organizationId;
  },
};

export type { ListAuditLogsQuery };
