export type AuditAction =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_TOKEN_REFRESHED"
  | "AUTH_TOKEN_REFRESH_FAILED"
  | "AUTH_SESSION_REVOKED"
  | "AUTH_PROFILE_UPDATED"
  | "AUTH_PASSWORD_CHANGED"
  | "LEAD_CREATED"
  | "LEAD_UPDATED"
  | "LEAD_STATUS_CHANGED"
  | "LEAD_ASSIGNED"
  | "LEAD_REASSIGNED"
  | "LEAD_UNASSIGNED"
  | "ACTIVITY_LOGGED"
  | "USER_CREATED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED"
  | "TEAM_CREATED"
  | "TEAM_MEMBER_ADDED"
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "ORG_CREATED"
  | "ORG_UPDATED"
  | "ORG_STATUS_CHANGED"
  | "ORG_MODULES_UPDATED";

export type AuditEntityType =
  | "auth"
  | "lead"
  | "activity"
  | "user"
  | "team"
  | "role"
  | "organization";

export type AuditActor = {
  id: string;
  name: string;
  email: string;
  roleSlug: string | null;
};

export type AuditOrganization = {
  id: string;
  name: string;
  code: string;
};

export type AuditMetadata = {
  summary: string;
  actor?: AuditActor;
  organization?: AuditOrganization;
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
  related?: Record<string, { id: string; name: string; email?: string; slug?: string }>;
};

export type AuditLog = {
  id: string;
  organizationId: string | null;
  organization: AuditOrganization | null;
  actorId: string | null;
  actor: AuditActor | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  metadata: AuditMetadata;
  createdAt: string;
};

export type AuditListQuery = {
  search: string;
  action: AuditAction | "ALL";
  entityType: AuditEntityType | "ALL";
  from: string;
  to: string;
  page: number;
  pageSize: number;
};

export type PlatformAuditListQuery = AuditListQuery & {
  organizationId: string;
};

export type AuditListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListAuditLogsResult = {
  auditLogs: AuditLog[];
  meta: AuditListMeta;
};

export type AuditState = {
  auditLogs: AuditLog[];
  listMeta: AuditListMeta | null;
  listQuery: AuditListQuery | null;
  listStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
};

export const AUDIT_ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: "AUTH_LOGIN_SUCCESS", label: "Login success" },
  { value: "AUTH_LOGIN_FAILED", label: "Login failed" },
  { value: "AUTH_LOGOUT", label: "Logout" },
  { value: "AUTH_TOKEN_REFRESHED", label: "Token refreshed" },
  { value: "AUTH_TOKEN_REFRESH_FAILED", label: "Token refresh failed" },
  { value: "AUTH_SESSION_REVOKED", label: "Session revoked" },
  { value: "AUTH_PROFILE_UPDATED", label: "Profile updated" },
  { value: "AUTH_PASSWORD_CHANGED", label: "Password changed" },
  { value: "LEAD_CREATED", label: "Lead created" },
  { value: "LEAD_UPDATED", label: "Lead updated" },
  { value: "LEAD_STATUS_CHANGED", label: "Lead status changed" },
  { value: "LEAD_ASSIGNED", label: "Lead assigned" },
  { value: "LEAD_REASSIGNED", label: "Lead reassigned" },
  { value: "LEAD_UNASSIGNED", label: "Lead unassigned" },
  { value: "ACTIVITY_LOGGED", label: "Activity logged" },
  { value: "USER_CREATED", label: "User created" },
  { value: "USER_ACTIVATED", label: "User activated" },
  { value: "USER_DEACTIVATED", label: "User deactivated" },
  { value: "TEAM_CREATED", label: "Team created" },
  { value: "TEAM_MEMBER_ADDED", label: "Team member added" },
  { value: "ROLE_CREATED", label: "Role created" },
  { value: "ROLE_UPDATED", label: "Role updated" },
  { value: "ROLE_DELETED", label: "Role deleted" },
  { value: "ORG_CREATED", label: "Organization created" },
  { value: "ORG_UPDATED", label: "Organization updated" },
  { value: "ORG_STATUS_CHANGED", label: "Organization status changed" },
  { value: "ORG_MODULES_UPDATED", label: "Organization modules updated" },
];

export const AUDIT_ENTITY_TYPE_OPTIONS: {
  value: AuditEntityType;
  label: string;
}[] = [
  { value: "auth", label: "Auth" },
  { value: "lead", label: "Lead" },
  { value: "activity", label: "Activity" },
  { value: "user", label: "User" },
  { value: "team", label: "Team" },
  { value: "role", label: "Role" },
  { value: "organization", label: "Organization" },
];

export const formatAuditActionLabel = (action: AuditAction): string => {
  const match = AUDIT_ACTION_OPTIONS.find((option) => option.value === action);
  return match?.label ?? action;
};

export const getAuditActionCategory = (
  action: AuditAction,
): "auth" | "lead" | "admin" => {
  if (action.startsWith("AUTH_")) return "auth";
  if (
    action.startsWith("LEAD_") ||
    action === "ACTIVITY_LOGGED"
  ) {
    return "lead";
  }
  return "admin";
};
