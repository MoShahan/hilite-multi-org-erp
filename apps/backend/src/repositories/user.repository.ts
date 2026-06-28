import {
  UserStatus,
  type Prisma,
} from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { prisma } from "../lib/prisma";
import { userWithAuthInclude } from "../lib/authUserMapper";
import type { ParsedListUsersQuery } from "../types/user";
import { toPrismaRoleMembershipScope } from "../lib/roleMembershipScope";

const userListInclude = {
  userRole: {
    include: {
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
          membershipScope: true,
        },
      },
    },
  },
  teamMembers: {
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 1,
  },
} as const;

export type UserListRecord = Prisma.UserGetPayload<{
  include: typeof userListInclude;
}>;

const buildWhere = (
  organizationId: string,
  query: ParsedListUsersQuery,
): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = { organizationId };

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.roleId || query.membershipScope || query.for === "lead-assignment") {
    const userRoleFilter: Prisma.UserRoleAssignmentWhereInput = {};

    if (query.roleId) {
      userRoleFilter.roleId = query.roleId;
    }

    const roleFilter: Prisma.RoleWhereInput = {};

    if (query.membershipScope) {
      roleFilter.membershipScope = toPrismaRoleMembershipScope(
        query.membershipScope,
      );
    }

    if (query.for === "lead-assignment") {
      roleFilter.permissions = {
        some: { permissionKey: PERMISSIONS.LEADS_ASSIGNABLE },
      };
    }

    if (Object.keys(roleFilter).length > 0) {
      userRoleFilter.role = roleFilter;
    }

    where.userRole = userRoleFilter;
  }

  if (query.teamIdIsNone) {
    where.teamMembers = { none: {} };
  } else if (query.teamId) {
    where.teamMembers = { some: { teamId: query.teamId } };
  }

  return where;
};

const buildOrderBy = (
  sortBy: ParsedListUsersQuery["sortBy"],
  sortOrder: ParsedListUsersQuery["sortOrder"],
): Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] => {
  if (sortBy === "role") {
    return { userRole: { role: { name: sortOrder } } };
  }

  if (sortBy === "team") {
    return { teamMembers: { _count: sortOrder } };
  }

  return { [sortBy]: sortOrder };
};

export const orgUserRepository = {
  findManyPaginated: async (
    organizationId: string,
    query: ParsedListUsersQuery,
  ) => {
    const where = buildWhere(organizationId, query);
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        include: userListInclude,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  createWithRole: async (data: {
    organizationId: string;
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
  }): Promise<UserListRecord> => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          mustChangePassword: true,
          status: UserStatus.ACTIVE,
        },
      });

      await tx.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: data.roleId,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: userListInclude,
      });
    });
  },

  findRoleForOrganization: (roleId: string, organizationId: string) => {
    return prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });
  },

  findByIdForOrganization: (
    userId: string,
    organizationId: string,
  ): Promise<UserListRecord | null> => {
    return prisma.user.findFirst({
      where: { id: userId, organizationId },
      include: userListInclude,
    });
  },

  updateStatus: (
    userId: string,
    status: UserStatus,
  ): Promise<UserListRecord> => {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      include: userListInclude,
    });
  },

  countActiveByRoleSlug: (
    organizationId: string,
    roleSlug: string,
  ): Promise<number> => {
    return prisma.user.count({
      where: {
        organizationId,
        status: UserStatus.ACTIVE,
        userRole: {
          role: {
            slug: roleSlug,
          },
        },
      },
    });
  },
};

export const authUserRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      include: userWithAuthInclude,
    });
  },

  findById: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: userWithAuthInclude,
    });
  },

  emailExists: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  updateProfile: (
    userId: string,
    data: { name: string; phoneNumber: string | null },
  ) => {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
      },
      include: userWithAuthInclude,
    });
  },

  updatePasswordHash: (userId: string, passwordHash: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });
  },
};
