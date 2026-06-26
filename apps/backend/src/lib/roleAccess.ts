import { RoleMembershipScope } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { getRoleAssignmentRules } from "./roleAssignmentRules";
import type { AuthUser } from "../types/auth";
import type { ListRolesQuery } from "../types/role";
import { AppError } from "../utils/AppError";

const hasPermission = (user: AuthUser, permission: string) =>
  user.permissions.includes(permission);

export const isTeamAssignableRole = (role: {
  slug: string;
  membershipScope: RoleMembershipScope;
}) => getRoleAssignmentRules(role).assignableFrom.includes("team");

export const authorizeRoleListAccess = (
  authUser: AuthUser,
  query: ListRolesQuery,
): ListRolesQuery => {
  if (hasPermission(authUser, PERMISSIONS.ROLES_READ)) {
    return query;
  }

  if (hasPermission(authUser, PERMISSIONS.ROLES_READ_TEAM)) {
    return { ...query, assignableFrom: "team" };
  }

  throw AppError.forbidden("You do not have permission to view roles");
};

export const authorizeRoleDetailAccess = (
  authUser: AuthUser,
  role: { slug: string; membershipScope: RoleMembershipScope },
) => {
  if (hasPermission(authUser, PERMISSIONS.ROLES_READ)) {
    return;
  }

  if (
    hasPermission(authUser, PERMISSIONS.ROLES_READ_TEAM) &&
    isTeamAssignableRole(role)
  ) {
    return;
  }

  throw AppError.forbidden("You do not have permission to view this role");
};
