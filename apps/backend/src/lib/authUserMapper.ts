import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { organizationModuleService } from "../services/organizationModule.service";
import { AppError } from "../utils/AppError";

import { flattenAuthUser, toAuthMembership } from "./authContext";

import type {
  AuthContext,
  AuthMeResponse,
  AuthOrganization,
  AuthUserIdentity,
} from "../types/auth";

type MembershipWithRelations = {
  status: UserStatus;
  organization: {
    id: string;
    name: string;
    code: string;
    status: OrganizationStatus;
  };
  role: {
    id: string;
    name: string;
    slug: string;
    permissions: { permissionKey: string }[];
  };
  teamMember: {
    team: {
      id: string;
      name: string;
    };
  } | null;
};

export type UserWithAuthRelations = AuthUserIdentity & {
  memberships: MembershipWithRelations[];
  userRole: {
    role: {
      id: string;
      name: string;
      slug: string;
      permissions: { permissionKey: string }[];
    };
  } | null;
};

export const userWithAuthInclude = {
  memberships: {
    include: {
      organization: true,
      role: {
        include: {
          permissions: true,
        },
      },
      teamMember: {
        include: {
          team: true,
        },
      },
    },
  },
  userRole: {
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  },
} as const;

const toAuthOrganization = (
  organization: MembershipWithRelations["organization"],
): AuthOrganization => ({
  id: organization.id,
  name: organization.name,
  code: organization.code,
  status: organization.status,
});

const toPlatformAuthContext = async (
  user: UserWithAuthRelations,
): Promise<AuthContext> => {
  if (!user.userRole?.role) {
    throw new AppError(
      403,
      "ROLE_NOT_ASSIGNED",
      "Your account does not have a role assigned",
    );
  }

  const role = user.userRole.role;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      status: user.status,
    },
    organization: null,
    membership: {
      role: {
        id: role.id,
        name: role.name,
        slug: role.slug,
      },
      permissions: role.permissions.map((entry) => entry.permissionKey),
      team: null,
    },
    modules: await organizationModuleService.getEnabledModuleKeys(null),
  };
};

const toOrgAuthContext = async (
  user: UserWithAuthRelations,
  organizationId: string,
): Promise<AuthContext> => {
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

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      status: user.status,
    },
    organization: toAuthOrganization(membership.organization),
    membership: toAuthMembership(membership),
    modules: await organizationModuleService.getEnabledModuleKeys(organizationId),
  };
};

export const toAuthContext = async (
  user: UserWithAuthRelations,
  organizationId: string | null,
): Promise<AuthContext> => {
  if (organizationId === null) {
    return toPlatformAuthContext(user);
  }

  return toOrgAuthContext(user, organizationId);
};

export const toAuthMeResponse = (context: AuthContext): AuthMeResponse => ({
  user: flattenAuthUser(context),
  organization: context.organization,
  modules: context.modules,
});
