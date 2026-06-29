import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { resolveLoginOrgId } from "./orgMembership";
import type { UserWithAuthRelations } from "./authUserMapper";
import { AppError } from "../utils/AppError";

export const resolveSessionOrgId = (
  user: UserWithAuthRelations,
  tokenOrgId?: string | null,
): string | null => {
  if (tokenOrgId !== undefined && tokenOrgId !== null) {
    return tokenOrgId;
  }

  if (user.memberships.length === 0) {
    return null;
  }

  return resolveLoginOrgId(
    user.memberships.map((membership) => ({
      organizationId: membership.organization.id,
      status: membership.status,
    })),
  );
};

export const assertActiveUser = (
  user: UserWithAuthRelations,
  organizationId: string | null,
) => {
  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "ACCOUNT_INACTIVE", "Your account is inactive");
  }

  if (organizationId === null) {
    if (user.memberships.length > 0) {
      throw new AppError(
        403,
        "ORG_CONTEXT_REQUIRED",
        "Organization context is required",
      );
    }

    return;
  }

  const membership = user.memberships.find(
    (entry) => entry.organization.id === organizationId,
  );

  if (!membership) {
    throw AppError.unauthorized();
  }

  if (membership.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "ACCOUNT_INACTIVE", "Your account is inactive");
  }

  if (membership.organization.status !== OrganizationStatus.ACTIVE) {
    throw new AppError(403, "ORG_SUSPENDED", "Your organization is suspended");
  }
};

export const assertUserHasAccess = (
  user: UserWithAuthRelations,
  organizationId: string | null,
) => {
  if (organizationId === null) {
    if (!user.userRole?.role) {
      throw new AppError(
        403,
        "ROLE_NOT_ASSIGNED",
        "Your account does not have a role assigned",
      );
    }

    return;
  }

  const membership = user.memberships.find(
    (entry) => entry.organization.id === organizationId,
  );

  if (!membership?.role) {
    throw new AppError(
      403,
      "ROLE_NOT_ASSIGNED",
      "Your account does not have a role assigned",
    );
  }
};
