import { PLATFORM_ROLE } from "../constants/defaultRoles";
import { UserStatus, type Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

import type { ParsedListPlatformUsersQuery } from "../types/platformUser";

const platformUserInclude = {
  userRole: {
    include: {
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} as const;

export type PlatformUserRecord = Prisma.UserGetPayload<{
  include: typeof platformUserInclude;
}>;

const platformUserWhere = {
  memberships: { none: {} },
  userRole: {
    role: {
      organizationId: null,
      slug: PLATFORM_ROLE.slug,
    },
  },
} satisfies Prisma.UserWhereInput;

const buildWhere = (
  query: ParsedListPlatformUsersQuery,
): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {
    ...platformUserWhere,
  };

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const buildOrderBy = (
  sortBy: ParsedListPlatformUsersQuery["sortBy"],
  sortOrder: ParsedListPlatformUsersQuery["sortOrder"],
): Prisma.UserOrderByWithRelationInput => {
  if (sortBy === "status") {
    return { status: sortOrder };
  }

  return { [sortBy]: sortOrder };
};

export const platformUserRepository = {
  findManyPaginated: async (query: ParsedListPlatformUsersQuery) => {
    const where = buildWhere(query);
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        include: platformUserInclude,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  findPlatformRole: () => {
    return prisma.role.findFirst({
      where: {
        organizationId: null,
        slug: PLATFORM_ROLE.slug,
      },
    });
  },

  findById: async (userId: string): Promise<PlatformUserRecord | null> => {
    return prisma.user.findFirst({
      where: {
        id: userId,
        ...platformUserWhere,
      },
      include: platformUserInclude,
    });
  },

  countActivePlatformAdmins: (): Promise<number> => {
    return prisma.user.count({
      where: {
        ...platformUserWhere,
        status: UserStatus.ACTIVE,
      },
    });
  },

  updateStatus: (
    userId: string,
    status: UserStatus,
  ): Promise<PlatformUserRecord> => {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      include: platformUserInclude,
    });
  },

  createPlatformAdmin: async (data: {
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
  }): Promise<PlatformUserRecord> => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
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
        include: platformUserInclude,
      });
    });
  },
};
