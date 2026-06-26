import type { AuthContext, AuthMeResponse, AuthRole, AuthUser } from "../types/auth";
import { organizationModuleService } from "../services/organizationModule.service";
import { AppError } from "../utils/AppError";

type UserWithAuthRelations = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  status: AuthUser["status"];
  organizationId: string | null;
  organization: AuthContext["organization"];
  teamMembers: {
    team: {
      id: string;
      name: string;
    };
  }[];
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
  organization: true,
  teamMembers: {
    include: {
      team: true,
    },
    take: 1,
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

const toAuthRole = (
  role: NonNullable<UserWithAuthRelations["userRole"]>["role"],
): AuthRole => ({
  id: role.id,
  name: role.name,
  slug: role.slug,
});

const toAuthUser = (user: UserWithAuthRelations): AuthUser => {
  const roleRecord = user.userRole?.role ?? null;
  const permissions = roleRecord
    ? roleRecord.permissions.map((entry) => entry.permissionKey)
    : [];

  const teamMember = user.teamMembers[0] ?? null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    status: user.status,
    organizationId: user.organizationId,
    role: roleRecord ? toAuthRole(roleRecord) : null,
    permissions,
    team: teamMember
      ? {
          id: teamMember.team.id,
          name: teamMember.team.name,
        }
      : null,
  };
};

export const assertUserHasRole = (user: UserWithAuthRelations) => {
  if (!user.userRole?.role) {
    throw new AppError(
      403,
      "ROLE_NOT_ASSIGNED",
      "Your account does not have a role assigned",
    );
  }
};

export const toAuthContext = async (
  user: UserWithAuthRelations,
): Promise<AuthContext> => {
  assertUserHasRole(user);

  const authUser = toAuthUser(user);
  const modules = await organizationModuleService.getEnabledModuleKeys(
    user.organizationId,
  );

  return {
    user: authUser,
    organization: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
          code: user.organization.code,
          status: user.organization.status,
        }
      : null,
    modules,
  };
};

export const toAuthMeResponse = (context: AuthContext): AuthMeResponse => ({
  user: context.user,
  organization: context.organization,
  modules: context.modules,
});
