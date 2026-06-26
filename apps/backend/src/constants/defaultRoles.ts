import { PERMISSIONS } from "./permissions";

export type RoleMembershipScopeValue = "team" | "organization";

export type AssignableFromValue = "users" | "team";

export type DefaultRoleDefinition = {
  slug: string;
  name: string;
  permissions: string[];
  membershipScope: RoleMembershipScopeValue;
  requiresTeamMembership: boolean;
  assignableFrom: AssignableFromValue[];
};

export const PLATFORM_ROLE: DefaultRoleDefinition = {
  slug: "platform_admin",
  name: "Platform Admin",
  membershipScope: "organization",
  requiresTeamMembership: false,
  assignableFrom: [],
  permissions: [
    PERMISSIONS.PLATFORM_ORGS_READ,
    PERMISSIONS.PLATFORM_ORGS_WRITE,
    PERMISSIONS.PLATFORM_AUDIT_READ,
  ],
};

export const DEFAULT_ORG_ROLES: DefaultRoleDefinition[] = [
  {
    slug: "org_admin",
    name: "Org Admin",
    membershipScope: "organization",
    requiresTeamMembership: false,
    assignableFrom: ["users"],
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_WRITE,
      PERMISSIONS.TEAMS_READ,
      PERMISSIONS.TEAMS_WRITE,
      PERMISSIONS.ROLES_READ,
      PERMISSIONS.ROLES_WRITE,
      PERMISSIONS.LEADS_READ_ORG,
      PERMISSIONS.AUDIT_READ,
    ],
  },
  {
    slug: "executive",
    name: "Executive",
    membershipScope: "team",
    requiresTeamMembership: true,
    assignableFrom: ["team"],
    permissions: [
      PERMISSIONS.LEADS_READ,
      PERMISSIONS.LEADS_ASSIGNABLE,
      PERMISSIONS.LEADS_STATUS_WRITE,
      PERMISSIONS.ACTIVITIES_WRITE,
      PERMISSIONS.DASHBOARD_ME,
    ],
  },
  {
    slug: "team_lead",
    name: "Team Leader",
    membershipScope: "team",
    requiresTeamMembership: true,
    assignableFrom: ["team"],
    permissions: [
      PERMISSIONS.USERS_READ_TEAM,
      PERMISSIONS.USERS_WRITE_TEAM,
      PERMISSIONS.ROLES_READ_TEAM,
      PERMISSIONS.LEADS_READ_TEAM,
      PERMISSIONS.LEADS_WRITE,
      PERMISSIONS.LEADS_STATUS_WRITE_TEAM,
      PERMISSIONS.DASHBOARD_TEAM,
    ],
  },
  {
    slug: "sales_manager",
    name: "Sales Manager",
    membershipScope: "organization",
    requiresTeamMembership: false,
    assignableFrom: ["users"],
    permissions: [
      PERMISSIONS.LEADS_READ_ORG,
      PERMISSIONS.LEADS_WRITE,
    ],
  },
  {
    slug: "director",
    name: "Director",
    membershipScope: "organization",
    requiresTeamMembership: false,
    assignableFrom: ["users"],
    permissions: [
      PERMISSIONS.LEADS_READ_ORG,
      PERMISSIONS.LEADS_WRITE,
      PERMISSIONS.DASHBOARD_ORG,
    ],
  },
];

export const PROTECTED_ROLE_SLUGS = new Set([
  PLATFORM_ROLE.slug,
  ...DEFAULT_ORG_ROLES.map((role) => role.slug),
]);

const defaultRoleBySlug = new Map(
  DEFAULT_ORG_ROLES.map((role) => [role.slug, role]),
);

export const getDefaultRoleDefinition = (slug: string) =>
  defaultRoleBySlug.get(slug);
