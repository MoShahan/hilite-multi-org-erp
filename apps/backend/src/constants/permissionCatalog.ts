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
    key: PERMISSIONS.PLATFORM_USERS_READ,
    label: "View platform admins",
    description: "View platform administrator accounts",
    scope: "PLATFORM",
  },
  {
    key: PERMISSIONS.PLATFORM_USERS_WRITE,
    label: "Manage platform admins",
    description: "Create platform administrator accounts",
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
    key: PERMISSIONS.USERS_WRITE_TEAM,
    label: "Manage team users",
    description: "Create users on the caller's team",
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
    key: PERMISSIONS.ROLES_READ_TEAM,
    label: "View team roles",
    description: "View team-assignable roles and their permissions",
    scope: "ORGANIZATION",
    grantScope: "team",
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
    label: "View leads in team",
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
    label: "Update leads in team",
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
    key: PERMISSIONS.DASHBOARD_ME,
    label: "My dashboard",
    description: "Access personal sales analytics",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.DASHBOARD_TEAM,
    label: "Team dashboard",
    description: "Access team sales analytics",
    scope: "ORGANIZATION",
    grantScope: "team",
  },
  {
    key: PERMISSIONS.DASHBOARD_ORG,
    label: "Organization dashboard",
    description: "Access organization-wide sales analytics",
    scope: "ORGANIZATION",
    grantScope: "org_wide",
  },
  {
    key: PERMISSIONS.AUDIT_READ,
    label: "View audit trail",
    description: "View the organization audit trail",
    scope: "ORGANIZATION",
  },
  {
    key: PERMISSIONS.PLATFORM_AUDIT_READ,
    label: "View platform audit trail",
    description: "View audit events across all organizations",
    scope: "PLATFORM",
  },
];

export const PERMISSION_CATALOG_ORDER = PERMISSION_CATALOG.map(
  (entry) => entry.key,
);
