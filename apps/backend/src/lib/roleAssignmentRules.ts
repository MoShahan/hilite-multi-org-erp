import {
  DEFAULT_ORG_ROLES,
  getDefaultRoleDefinition,
  type AssignableFromValue,
} from "../constants/defaultRoles";
import { RoleMembershipScope } from "../generated/prisma/client";
import { toApiRoleMembershipScope } from "./roleMembershipScope";

export type RoleAssignmentRules = {
  membershipScope: "team" | "organization";
  requiresTeamMembership: boolean;
  assignableFrom: AssignableFromValue[];
};

const customRoleDefaults: RoleAssignmentRules = {
  membershipScope: "organization",
  requiresTeamMembership: false,
  assignableFrom: ["users", "team"],
};

export const getRoleAssignmentRulesBySlug = (
  slug: string,
): RoleAssignmentRules => {
  const definition = getDefaultRoleDefinition(slug);

  if (!definition) {
    return customRoleDefaults;
  }

  return {
    membershipScope: definition.membershipScope,
    requiresTeamMembership: definition.requiresTeamMembership,
    assignableFrom: definition.assignableFrom,
  };
};

export const getRoleAssignmentRules = (role: {
  slug: string;
  membershipScope: RoleMembershipScope;
}): RoleAssignmentRules => {
  const definition = getDefaultRoleDefinition(role.slug);

  if (definition) {
    return {
      membershipScope: definition.membershipScope,
      requiresTeamMembership: definition.requiresTeamMembership,
      assignableFrom: definition.assignableFrom,
    };
  }

  return {
    ...customRoleDefaults,
    membershipScope: toApiRoleMembershipScope(role.membershipScope),
  };
};

export const assertRoleAssignableFrom = (
  rules: RoleAssignmentRules,
  context: AssignableFromValue,
) => {
  if (!rules.assignableFrom.includes(context)) {
    throw new Error(
      `Role cannot be assigned from ${context} context`,
    );
  }
};

export const listDefaultAssignableSlugs = (context: AssignableFromValue) =>
  DEFAULT_ORG_ROLES.filter((role) =>
    role.assignableFrom.includes(context),
  ).map((role) => role.slug);
