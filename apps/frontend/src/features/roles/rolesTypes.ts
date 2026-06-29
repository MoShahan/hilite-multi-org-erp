export type MembershipScope = "team" | "organization";

export type GrantScope = "team" | "org_wide";

export type AssignableFrom = "users" | "team";

export type PermissionScope = "PLATFORM" | "ORGANIZATION";

export type PermissionCatalogItem = {
  key: string;
  label: string;
  description: string | null;
  scope: PermissionScope;
  grantScope?: GrantScope;
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  membershipScope: MembershipScope;
  requiresTeamMembership: boolean;
  assignableFrom: AssignableFrom[];
  permissions: string[];
  userCount: number;
  isProtected: boolean;
  canDelete: boolean;
};

export type CreateRoleInput = {
  name: string;
  slug: string;
  membershipScope: MembershipScope;
  permissions: string[];
};

export type UpdateRoleInput = {
  name?: string;
  permissions?: string[];
};

export type ListRolesOptions = {
  membershipScope?: MembershipScope;
  assignableFrom?: AssignableFrom;
};

export type RoleOption = {
  id: string;
  name: string;
  slug: string;
};

export type RoleOptionsResult = {
  roles: RoleOption[];
};
