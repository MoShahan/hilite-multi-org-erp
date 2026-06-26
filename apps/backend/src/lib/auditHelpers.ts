import type { AuditAction } from "../generated/prisma/client";
import type {
  AuditActorSnapshot,
  AuditMetadata,
  AuthUserForAudit,
} from "../types/audit";

export const buildActorSnapshot = (
  authUser: AuthUserForAudit,
): AuditActorSnapshot | undefined => {
  if (!authUser) {
    return undefined;
  }

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    roleSlug: authUser.role?.slug ?? null,
  };
};

export const buildChangeSet = <T extends Record<string, unknown>>(
  before: T,
  after: T,
  fields: (keyof T)[],
): {
  before: Partial<T>;
  after: Partial<T>;
  changedFields: string[];
} => {
  const changedBefore: Partial<T> = {};
  const changedAfter: Partial<T> = {};
  const changedFields: string[] = [];

  for (const field of fields) {
    const beforeValue = before[field];
    const afterValue = after[field];

    if (beforeValue !== afterValue) {
      changedBefore[field] = beforeValue;
      changedAfter[field] = afterValue;
      changedFields.push(String(field));
    }
  }

  return {
    before: changedBefore,
    after: changedAfter,
    changedFields,
  };
};

const ACTION_LABELS: Partial<Record<AuditAction, string>> = {
  AUTH_LOGIN_SUCCESS: "Logged in",
  AUTH_LOGIN_FAILED: "Failed login attempt",
  AUTH_LOGOUT: "Logged out",
  AUTH_TOKEN_REFRESHED: "Session refreshed",
  AUTH_TOKEN_REFRESH_FAILED: "Failed token refresh",
  AUTH_SESSION_REVOKED: "Session revoked",
  LEAD_CREATED: "Lead created",
  LEAD_UPDATED: "Lead updated",
  LEAD_STATUS_CHANGED: "Lead status changed",
  LEAD_ASSIGNED: "Lead assigned",
  LEAD_REASSIGNED: "Lead reassigned",
  LEAD_UNASSIGNED: "Lead unassigned",
  ACTIVITY_LOGGED: "Activity logged",
  USER_CREATED: "User created",
  USER_ACTIVATED: "User activated",
  USER_DEACTIVATED: "User deactivated",
  TEAM_CREATED: "Team created",
  TEAM_MEMBER_ADDED: "Team member added",
  ROLE_CREATED: "Role created",
  ROLE_UPDATED: "Role updated",
  ROLE_DELETED: "Role deleted",
  ORG_CREATED: "Organization created",
  ORG_UPDATED: "Organization updated",
  ORG_STATUS_CHANGED: "Organization status changed",
  ORG_MODULES_UPDATED: "Organization modules updated",
};

export const buildSummary = (
  action: AuditAction,
  metadata: Partial<AuditMetadata>,
): string => {
  if (metadata.summary) {
    return metadata.summary;
  }

  const label = ACTION_LABELS[action] ?? action;

  if (metadata.related?.lead?.name) {
    return `${label}: ${metadata.related.lead.name}`;
  }

  if (metadata.related?.targetUser?.name) {
    return `${label}: ${metadata.related.targetUser.name}`;
  }

  if (metadata.after && "name" in metadata.after && metadata.after.name) {
    return `${label}: ${String(metadata.after.name)}`;
  }

  return label;
};

export const mergeRequestContext = (
  metadata: AuditMetadata,
  requestContext?: { ip?: string; userAgent?: string },
): AuditMetadata => {
  if (!requestContext?.ip && !requestContext?.userAgent) {
    return metadata;
  }

  return {
    ...metadata,
    request: {
      ...metadata.request,
      ...requestContext,
    },
  };
};
