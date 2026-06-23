import type { RoleMembershipScopeValue } from "../constants/defaultRoles";

export type AssignableFrom = "users" | "team";

export type RoleResponse = {
  id: string;
  name: string;
  slug: string;
  membershipScope: RoleMembershipScopeValue;
  requiresTeamMembership: boolean;
  assignableFrom: AssignableFrom[];
  permissions: string[];
  userCount: number;
  isProtected: boolean;
  canDelete: boolean;
};

export type ListRolesResponse = {
  roles: RoleResponse[];
};

export type RoleDetailResponse = {
  role: RoleResponse;
};

export type CreateRoleInput = {
  name: string;
  slug: string;
  membershipScope: RoleMembershipScopeValue;
  permissions: string[];
};

export type UpdateRoleInput = {
  name?: string;
  permissions?: string[];
};

export type ListRolesQuery = {
  membershipScope?: RoleMembershipScopeValue;
  assignableFrom?: AssignableFrom;
};
