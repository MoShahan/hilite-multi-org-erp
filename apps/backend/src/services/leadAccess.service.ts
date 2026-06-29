import { TERMINAL_LEAD_STAGES } from "@hilite/shared";

import { PERMISSIONS } from "../constants/permissions";
import { LeadStatus, UserStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

import type { AuthUser } from "../types/auth";


type LeadAccessRecord = {
  id: string;
  organizationId: string;
  teamId: string;
  assignedToId: string | null;
  status: LeadStatus;
};

const hasPermission = (user: AuthUser, permission: string) =>
  user.permissions.includes(permission);

const assertLeadIsOpen = (lead: LeadAccessRecord) => {
  if (TERMINAL_LEAD_STAGES.includes(lead.status)) {
    throw AppError.badRequest("This lead is closed and cannot be modified");
  }
};

export const getCallerTeamId = (user: AuthUser): string | null =>
  user.team?.id ?? null;

export const resolveLeadListScope = (
  user: AuthUser,
  organizationId: string,
) => {
  if (hasPermission(user, PERMISSIONS.LEADS_READ_ORG)) {
    return { organizationId };
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_TEAM)) {
    const teamId = getCallerTeamId(user);
    if (!teamId) {
      throw AppError.forbidden("Team context is required to view leads in team");
    }

    return { organizationId, teamId };
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ)) {
    return { organizationId, assignedToId: user.id };
  }

  throw AppError.forbidden("You do not have permission to view leads");
};

export const assertCanReadLead = (
  lead: LeadAccessRecord,
  user: AuthUser,
  organizationId: string,
) => {
  if (lead.organizationId !== organizationId) {
    throw AppError.notFound("Lead not found");
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_ORG)) {
    return;
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_TEAM)) {
    const teamId = getCallerTeamId(user);
    if (teamId && lead.teamId === teamId) {
      return;
    }

    throw AppError.forbidden("You do not have permission to view this lead");
  }

  if (
    hasPermission(user, PERMISSIONS.LEADS_READ) &&
    lead.assignedToId === user.id
  ) {
    return;
  }

  throw AppError.forbidden("You do not have permission to view this lead");
};

export const assertCanWriteLead = (
  lead: LeadAccessRecord,
  user: AuthUser,
  organizationId: string,
) => {
  assertLeadIsOpen(lead);

  if (!hasPermission(user, PERMISSIONS.LEADS_WRITE)) {
    throw AppError.forbidden("You do not have permission to manage leads");
  }

  assertCanReadLead(lead, user, organizationId);

  if (hasPermission(user, PERMISSIONS.LEADS_READ_ORG)) {
    return;
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_TEAM)) {
    const teamId = getCallerTeamId(user);
    if (teamId && lead.teamId === teamId) {
      return;
    }
  }

  throw AppError.forbidden("You do not have permission to manage this lead");
};

export const assertCanUpdateLeadStatus = (
  lead: LeadAccessRecord,
  user: AuthUser,
  organizationId: string,
) => {
  if (lead.organizationId !== organizationId) {
    throw AppError.notFound("Lead not found");
  }

  if (hasPermission(user, PERMISSIONS.LEADS_WRITE)) {
    assertCanWriteLead(lead, user, organizationId);
    return;
  }

  if (hasPermission(user, PERMISSIONS.LEADS_STATUS_WRITE_TEAM)) {
    const teamId = getCallerTeamId(user);
    if (!teamId) {
      throw AppError.forbidden("Team context is required to update leads in team");
    }

    if (lead.teamId === teamId) {
      return;
    }

    throw AppError.forbidden(
      "You do not have permission to update status on this lead",
    );
  }

  if (hasPermission(user, PERMISSIONS.LEADS_STATUS_WRITE)) {
    if (lead.assignedToId === user.id) {
      return;
    }

    throw AppError.forbidden(
      "You can only update status on leads assigned to you",
    );
  }

  throw AppError.forbidden(
    "You do not have permission to update lead status",
  );
};

export const assertCanReassignLead = (
  lead: LeadAccessRecord,
  user: AuthUser,
  organizationId: string,
) => {
  assertLeadIsOpen(lead);

  if (!hasPermission(user, PERMISSIONS.LEADS_WRITE)) {
    throw AppError.forbidden("You do not have permission to assign leads");
  }

  if (!hasPermission(user, PERMISSIONS.LEADS_READ_TEAM)) {
    throw AppError.forbidden("You do not have permission to reassign leads");
  }

  const teamId = getCallerTeamId(user);
  if (!teamId || lead.teamId !== teamId) {
    throw AppError.forbidden("You can only reassign leads on your team");
  }

  if (lead.organizationId !== organizationId) {
    throw AppError.notFound("Lead not found");
  }
};

export const resolveCreateTeamId = (
  user: AuthUser,
  requestedTeamId: string | undefined,
): string => {
  if (!hasPermission(user, PERMISSIONS.LEADS_WRITE)) {
    throw AppError.forbidden("You do not have permission to create leads");
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_TEAM)) {
    const teamId = getCallerTeamId(user);
    if (!teamId) {
      throw AppError.badRequest("You must belong to a team to create leads");
    }

    if (requestedTeamId && requestedTeamId !== teamId) {
      throw AppError.badRequest("You can only create leads for your team", [
        { field: "teamId", message: "You can only create leads for your team" },
      ]);
    }

    return teamId;
  }

  if (hasPermission(user, PERMISSIONS.LEADS_READ_ORG)) {
    if (!requestedTeamId) {
      throw AppError.badRequest("Team is required", [
        { field: "teamId", message: "Team is required" },
      ]);
    }

    return requestedTeamId;
  }

  throw AppError.forbidden("You do not have permission to create leads");
};

export const assertAssigneeEligible = async (
  assigneeId: string,
  teamId: string,
  organizationId: string,
) => {
  const assignee = await prisma.organizationMember.findFirst({
    where: {
      userId: assigneeId,
      organizationId,
      status: UserStatus.ACTIVE,
      teamMember: { teamId },
      role: {
        permissions: {
          some: { permissionKey: PERMISSIONS.LEADS_ASSIGNABLE },
        },
      },
    },
    select: { userId: true },
  });

  if (!assignee) {
    throw AppError.badRequest("Assignee is not eligible for this lead", [
      {
        field: "assignedToId",
        message: "Selected user cannot be assigned to this lead",
      },
    ]);
  }
};

export const assertCanCreateActivity = (
  lead: LeadAccessRecord,
  user: AuthUser,
) => {
  assertLeadIsOpen(lead);

  if (!hasPermission(user, PERMISSIONS.ACTIVITIES_WRITE)) {
    throw AppError.forbidden("You do not have permission to log activities");
  }

  if (lead.assignedToId !== user.id) {
    throw AppError.forbidden(
      "Only the current assignee can log activities on this lead",
    );
  }
};
