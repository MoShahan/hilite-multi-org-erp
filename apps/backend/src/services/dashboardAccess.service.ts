import { LeadStatus, type Prisma } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";

export type DashboardView = "executive" | "team_lead" | "director";

const hasPermission = (user: AuthUser, permission: string) =>
  user.permissions.includes(permission);

export const assertHasDashboardAccess = (user: AuthUser) => {
  if (
    !hasPermission(user, PERMISSIONS.DASHBOARD_EXECUTIVE) &&
    !hasPermission(user, PERMISSIONS.DASHBOARD_TEAM_LEAD) &&
    !hasPermission(user, PERMISSIONS.DASHBOARD_DIRECTOR)
  ) {
    throw AppError.forbidden("You do not have permission to access the dashboard");
  }
};

export const resolveDashboardView = (user: AuthUser): DashboardView => {
  if (hasPermission(user, PERMISSIONS.DASHBOARD_DIRECTOR)) {
    return "director";
  }

  if (hasPermission(user, PERMISSIONS.DASHBOARD_TEAM_LEAD)) {
    return "team_lead";
  }

  if (hasPermission(user, PERMISSIONS.DASHBOARD_EXECUTIVE)) {
    return "executive";
  }

  throw AppError.forbidden("You do not have permission to access the dashboard");
};

export const resolveDashboardLeadScope = (
  user: AuthUser,
  organizationId: string,
  view: DashboardView,
): Prisma.LeadWhereInput => {
  const base = { organizationId };

  if (view === "director") {
    return base;
  }

  if (view === "team_lead") {
    const teamId = user.team?.id;
    if (!teamId) {
      throw AppError.forbidden("Team context is required for the team dashboard");
    }

    return { ...base, teamId };
  }

  return { ...base, assignedToId: user.id };
};

export const isClosedStatus = (status: LeadStatus) =>
  status === LeadStatus.WON || status === LeadStatus.LOST;

export const isNeedsAttentionStatus = (status: LeadStatus) =>
  status === LeadStatus.NEW || status === LeadStatus.CONTACTED;
