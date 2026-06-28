export const PERMISSIONS = {
  PLATFORM_ORGS_READ: "platform:orgs:read",
  PLATFORM_ORGS_WRITE: "platform:orgs:write",
  PLATFORM_USERS_READ: "platform:users:read",
  PLATFORM_USERS_WRITE: "platform:users:write",

  USERS_READ: "users:read",
  USERS_READ_TEAM: "users:read:team",
  USERS_WRITE: "users:write",
  USERS_WRITE_TEAM: "users:write:team",

  TEAMS_READ: "teams:read",
  TEAMS_WRITE: "teams:write",

  ROLES_READ: "roles:read",
  ROLES_READ_TEAM: "roles:read:team",
  ROLES_WRITE: "roles:write",

  LEADS_READ: "leads:read",
  LEADS_WRITE: "leads:write",
  LEADS_STATUS_WRITE: "leads:status:write",
  LEADS_STATUS_WRITE_TEAM: "leads:status:write:team",
  LEADS_READ_TEAM: "leads:read:team",
  LEADS_READ_ORG: "leads:read:org",
  LEADS_ASSIGNABLE: "leads:assignable",

  ACTIVITIES_WRITE: "activities:write",

  DASHBOARD_ME: "dashboard:me",
  DASHBOARD_TEAM: "dashboard:team",
  DASHBOARD_ORG: "dashboard:org",

  AUDIT_READ: "audit:read",
  PLATFORM_AUDIT_READ: "platform:audit:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const DASHBOARD_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_ME,
  PERMISSIONS.DASHBOARD_TEAM,
  PERMISSIONS.DASHBOARD_ORG,
] as const;

export const LEADS_READ_PERMISSIONS = [
  PERMISSIONS.LEADS_READ,
  PERMISSIONS.LEADS_READ_TEAM,
  PERMISSIONS.LEADS_READ_ORG,
] as const;
