export const PERMISSIONS = {
  PLATFORM_ORGS_READ: "platform:orgs:read",
  PLATFORM_ORGS_WRITE: "platform:orgs:write",

  USERS_READ: "users:read",
  USERS_READ_TEAM: "users:read:team",
  USERS_WRITE: "users:write",

  TEAMS_READ: "teams:read",
  TEAMS_WRITE: "teams:write",

  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",

  LEADS_READ: "leads:read",
  LEADS_WRITE: "leads:write",
  LEADS_STATUS_WRITE: "leads:status:write",
  LEADS_STATUS_WRITE_TEAM: "leads:status:write:team",
  LEADS_READ_TEAM: "leads:read:team",
  LEADS_READ_ORG: "leads:read:org",
  LEADS_ASSIGNABLE: "leads:assignable",

  ACTIVITIES_WRITE: "activities:write",

  DASHBOARD_EXECUTIVE: "dashboard:executive",
  DASHBOARD_TEAM_LEAD: "dashboard:team_lead",
  DASHBOARD_DIRECTOR: "dashboard:director",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
