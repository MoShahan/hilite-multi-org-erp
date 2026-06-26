import type { AuditAction } from "../generated/prisma/client";
import type { AuthUser } from "./auth";

export type AuditEntityType =
  | "auth"
  | "lead"
  | "activity"
  | "user"
  | "team"
  | "role"
  | "organization";

export type AuditActorSnapshot = {
  id: string;
  name: string;
  email: string;
  roleSlug: string | null;
};

export type AuditOrganizationSnapshot = {
  id: string;
  name: string;
  code: string;
};

export type AuditEntityRef = {
  id: string;
  name: string;
  email?: string;
  slug?: string;
};

export type AuditMetadata = {
  summary: string;
  actor?: AuditActorSnapshot;
  organization?: AuditOrganizationSnapshot;
  request?: {
    ip?: string;
    userAgent?: string;
  };
  email?: string;
  reason?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changedFields?: string[];
  permissionsAdded?: string[];
  permissionsRemoved?: string[];
  related?: {
    assignee?: AuditEntityRef;
    previousAssignee?: AuditEntityRef;
    team?: AuditEntityRef;
    role?: AuditEntityRef;
    lead?: AuditEntityRef;
    targetUser?: AuditEntityRef;
    orgAdmin?: AuditEntityRef;
  };
};

export type AuditRequestContext = {
  ip?: string;
  userAgent?: string;
};

export type CreateAuditLogInput = {
  organizationId?: string | null;
  actorId?: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  metadata: AuditMetadata;
  requestContext?: AuditRequestContext;
};

export type AuditLogResponse = {
  id: string;
  organizationId: string | null;
  organization: AuditOrganizationSnapshot | null;
  actorId: string | null;
  actor: AuditActorSnapshot | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  metadata: AuditMetadata;
  createdAt: string;
};

export type ListAuditLogsQuery = {
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  actorId?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  organizationId?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type ParsedListAuditLogsQuery = {
  page: number;
  pageSize: number;
  action?: AuditAction;
  actorId?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  organizationId?: string;
  from?: Date;
  to?: Date;
  search?: string;
};

export type AuditListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedAuditLogsResponse = {
  auditLogs: AuditLogResponse[];
  meta: AuditListMeta;
};

export type AuthUserForAudit = AuthUser | null | undefined;

export type AuditMutationContext = {
  authUser: AuthUser;
  requestContext?: AuditRequestContext;
};
