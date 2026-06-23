import { PERMISSIONS, type Permission } from "./permissions";

export type GrantScopeValue = "team" | "org_wide";

export type PermissionCatalogEntry = {
  key: Permission;
  label: string;
  description?: string;
  scope: "PLATFORM" | "ORGANIZATION";
  grantScope?: GrantScopeValue;
};

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  {
    key: PERMISSIONS.PLATFORM_ORGS_READ,
    label: "View organizations",
    description: "View all organizations on the platform",
    scope: "PLATFORM",
  },
  {
    key: PERMISSIONS.PLATFORM_ORGS_WRITE,
    label: "Manage organizations",
    description: "Create and update organizations on the platform",
    scope: "PLATFORM",
  },
  {
    key: PERMISSIONS.USERS_READ,
    label: "View users",
    description: "View users in the organization",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.USERS_READ_TEAM,
    label: "View team users",
    description: "View users on the caller's team",
    scope: "ORGANIZATION",
    grantScope: "team",
  },
  {
    key: PERMISSIONS.USERS_WRITE,
    label: "Manage users",
    description: "Create, update, and deactivate users",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.TEAMS_READ,
    label: "View teams",
    description: "View teams in the organization",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.TEAMS_WRITE,
    label: "Manage teams",
    description: "Create and update teams and memberships",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.ROLES_READ,
    label: "View roles",
    description: "View roles and their permissions",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.ROLES_WRITE,
    label: "Manage roles",
    description: "Create and update roles and permissions",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.LEADS_READ,
    label: "View own leads",
    description: "View leads assigned to the user",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.LEADS_READ_TEAM,
    label: "View team leads",
    description: "View leads assigned to team members",
    scope: "ORGANIZATION",
    grantScope: "team",
  },
  {
    key: PERMISSIONS.LEADS_READ_ORG,
    label: "View all org leads",
    description: "View all leads in the organization",
    scope: "ORGANIZATION",
    grantScope: "org_wide",
  },
  {
    key: PERMISSIONS.LEADS_WRITE,
    label: "Manage leads",
    description: "Create and update leads",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.LEADS_STATUS_WRITE,
    label: "Update own lead status",
    description: "Change status on leads assigned to the user",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.LEADS_STATUS_WRITE_TEAM,
    label: "Update team lead status",
    description: "Change status on leads belonging to the caller's team",
    scope: "ORGANIZATION",
    grantScope: "team",
  },
  {
    key: PERMISSIONS.LEADS_ASSIGNABLE,
    label: "Can be assigned leads",
    description: "User may be set as the owner of a lead",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.ACTIVITIES_WRITE,
    label: "Log activities",
    description: "Create activities on leads",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.DASHBOARD_EXECUTIVE,
    label: "Executive dashboard",
    description: "Access the executive dashboard",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.DASHBOARD_TEAM_LEAD,
    label: "Team lead dashboard",
    description: "Access the team lead dashboard",
    scope: "ORGANIZATION",
    grantScope: "team",
  },
  {
    key: PERMISSIONS.DASHBOARD_DIRECTOR,
    label: "Director dashboard",
    description: "Access the director dashboard",
    scope: "ORGANIZATION",
    grantScope: "org_wide",
  },
];

export const PERMISSION_CATALOG_ORDER = PERMISSION_CATALOG.map(
  (entry) => entry.key,
);
