import { UserStatus, type Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type {
  ParsedListTeamMembersQuery,
  ParsedListTeamsQuery,
  TeamListSortBy,
  TeamListSortOrder,
  TeamMemberListSortBy,
  TeamMemberListSortOrder,
} from "../types/team";

const teamWithMemberCount = {
  include: {
    _count: {
      select: { members: true },
    },
  },
} as const;

export type TeamWithMemberCount = Prisma.TeamGetPayload<{
  include: typeof teamWithMemberCount.include;
}>;

const memberListInclude = {
  user: {
    include: {
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
    },
  },
} as const;

export type TeamMemberRecord = Prisma.TeamMemberGetPayload<{
  include: typeof memberListInclude;
}>;

const buildWhere = (
  organizationId: string,
  query: ParsedListTeamsQuery,
): Prisma.TeamWhereInput => {
  const where: Prisma.TeamWhereInput = { organizationId };

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  if (query.membership === "WITH_MEMBERS") {
    where.members = { some: {} };
  } else if (query.membership === "EMPTY") {
    where.members = { none: {} };
  }

  return where;
};

const buildOrderBy = (
  sortBy: TeamListSortBy,
  sortOrder: TeamListSortOrder,
): Prisma.TeamOrderByWithRelationInput => {
  if (sortBy === "memberCount") {
    return { members: { _count: sortOrder } };
  }

  return { [sortBy]: sortOrder };
};

const buildMemberOrderBy = (
  sortBy: TeamMemberListSortBy,
  sortOrder: TeamMemberListSortOrder,
): Prisma.TeamMemberOrderByWithRelationInput => {
  if (sortBy === "role") {
    return { user: { userRole: { role: { name: sortOrder } } } };
  }

  return { user: { [sortBy]: sortOrder } };
};

export const teamRepository = {
  findManyPaginated: async (
    organizationId: string,
    query: ParsedListTeamsQuery,
  ) => {
    const where = buildWhere(organizationId, query);
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.pageSize;

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        ...teamWithMemberCount,
      }),
      prisma.team.count({ where }),
    ]);

    return { teams, total };
  },

  findByIdForOrganization: (
    teamId: string,
    organizationId: string,
  ): Promise<TeamWithMemberCount | null> => {
    return prisma.team.findFirst({
      where: { id: teamId, organizationId },
      ...teamWithMemberCount,
    });
  },

  create: (
    organizationId: string,
    name: string,
  ): Promise<TeamWithMemberCount> => {
    return prisma.team.create({
      data: { organizationId, name },
      ...teamWithMemberCount,
    });
  },

  findMembersPaginated: async (
    teamId: string,
    query: ParsedListTeamMembersQuery,
  ) => {
    const skip = (query.page - 1) * query.pageSize;
    const where: Prisma.TeamMemberWhereInput = { teamId };

    const userWhere: Prisma.UserWhereInput = {};

    if (query.search) {
      userWhere.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.roleId) {
      userWhere.userRole = { roleId: query.roleId };
    }

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }

    const orderBy = buildMemberOrderBy(query.sortBy, query.sortOrder);

    const [members, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        skip,
        take: query.pageSize,
        include: memberListInclude,
        orderBy,
      }),
      prisma.teamMember.count({ where }),
    ]);

    return { members, total };
  },

  createMemberWithUser: async (data: {
    organizationId: string;
    teamId: string;
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
  }): Promise<TeamMemberRecord> => {
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
        data: { userId: user.id, roleId: data.roleId },
      });

      const membership = await tx.teamMember.create({
        data: { teamId: data.teamId, userId: user.id },
        include: memberListInclude,
      });

      return membership;
    });
  },

  findRoleForOrganization: (roleId: string, organizationId: string) => {
    return prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });
  },
};
