import {
  RoleMembershipScope,
  type RoleMembershipScope as PrismaRoleMembershipScope,
} from "../generated/prisma/client";

import type { RoleMembershipScopeValue } from "../constants/defaultRoles";

export const toPrismaRoleMembershipScope = (
  scope: RoleMembershipScopeValue,
): PrismaRoleMembershipScope => {
  return scope === "team"
    ? RoleMembershipScope.TEAM
    : RoleMembershipScope.ORGANIZATION;
};

export const toApiRoleMembershipScope = (
  scope: PrismaRoleMembershipScope,
): RoleMembershipScopeValue => {
  return scope === RoleMembershipScope.TEAM ? "team" : "organization";
};

export const parseRoleMembershipScopeQuery = (
  value: unknown,
): RoleMembershipScopeValue | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "team" || normalized === "organization") {
    return normalized;
  }

  return undefined;
};
