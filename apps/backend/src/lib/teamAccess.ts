import { PERMISSIONS } from "../constants/permissions";
import { AppError } from "../utils/AppError";

import type { AuthUser } from "../types/auth";

const hasPermission = (user: AuthUser, permission: string) =>
  user.permissions.includes(permission);

const getCallerTeamId = (user: AuthUser): string | null => user.team?.id ?? null;

export type TeamMemberAccessAction = "read" | "write";

export const authorizeTeamMemberAccess = (
  authUser: AuthUser,
  teamId: string,
  action: TeamMemberAccessAction,
) => {
  if (action === "read") {
    if (hasPermission(authUser, PERMISSIONS.TEAMS_READ)) {
      return;
    }

    if (hasPermission(authUser, PERMISSIONS.USERS_READ_TEAM)) {
      const callerTeamId = getCallerTeamId(authUser);
      if (!callerTeamId) {
        throw AppError.forbidden("Team context is required to view team members");
      }
      if (teamId !== callerTeamId) {
        throw AppError.forbidden("You can only view members on your team");
      }
      return;
    }

    throw AppError.forbidden("You do not have permission to view team members");
  }

  if (
    hasPermission(authUser, PERMISSIONS.TEAMS_WRITE) ||
    hasPermission(authUser, PERMISSIONS.USERS_WRITE)
  ) {
    return;
  }

  if (hasPermission(authUser, PERMISSIONS.USERS_WRITE_TEAM)) {
    const callerTeamId = getCallerTeamId(authUser);
    if (!callerTeamId) {
      throw AppError.forbidden("Team context is required to add team members");
    }
    if (teamId !== callerTeamId) {
      throw AppError.forbidden("You can only add members to your team");
    }
    return;
  }

  throw AppError.forbidden("You do not have permission to manage team members");
};
