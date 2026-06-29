import {
  UserStatus,
  type Prisma,
} from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { prisma } from "../lib/prisma";
import { userWithAuthInclude } from "../lib/authUserMapper";
import { assignOrgMembership } from "../lib/orgMembership";
import type {
  ParsedListUsersQuery,
  ParsedUserOptionsQuery,
  UserListFor,
} from "../types/user";
import { toPrismaRoleMembershipScope } from "../lib/roleMembershipScope";

const membershipListInclude = {
  role: {
    select: {
      id: true,
      name: true,
      slug: true,
      membershipScope: true,
    },
  },
  teamMember: {
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  user: true,
} as const;

export type OrgMemberListRecord = Prisma.OrganizationMemberGetPayload<{
  include: typeof membershipListInclude;
}>;

const membershipOptionsSelect = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export type OrgMemberOptionRecord = Prisma.OrganizationMemberGetPayload<{
  select: typeof membershipOptionsSelect;
}>;

type MembershipListFilter = ParsedListUsersQuery & {
  for?: UserListFor;
};

const buildMembershipWhere = (
  organizationId: string,
  query: MembershipListFilter,
): Prisma.OrganizationMemberWhereInput => {
  const where: Prisma.OrganizationMemberWhereInput = { organizationId };

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.search) {
    where.user = {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }

  if (query.roleId) {
    where.roleId = query.roleId;
  }

  if (query.membershipScope) {
    const roleFilter: Prisma.RoleWhereInput = {
      membershipScope: toPrismaRoleMembershipScope(
        query.membershipScope,
      ),
    };

    where.role = roleFilter;
  }

  if (query.for === "lead-assignment") {
    where.role = {
      ...(where.role as Prisma.RoleWhereInput | undefined),
      permissions: {
        some: { permissionKey: PERMISSIONS.LEADS_ASSIGNABLE },
      },
    };
  }

  if (query.teamIdIsNone) {
    where.teamMember = { is: null };
  } else if (query.teamId) {
    where.teamMember = { teamId: query.teamId };
  }

  return where;
};

const buildMembershipOrderBy = (
  sortBy: ParsedListUsersQuery["sortBy"],
  sortOrder: ParsedListUsersQuery["sortOrder"],
):
  | Prisma.OrganizationMemberOrderByWithRelationInput
  | Prisma.OrganizationMemberOrderByWithRelationInput[] => {
  if (sortBy === "role") {
    return { role: { name: sortOrder } };
  }

  if (sortBy === "team") {
    return { teamMember: { team: { name: sortOrder } } };
  }

  if (sortBy === "name" || sortBy === "email") {
    return { user: { [sortBy]: sortOrder } };
  }

  return { user: { createdAt: sortOrder } };
};

export const orgUserRepository = {
  findManyPaginated: async (
    organizationId: string,
    query: ParsedListUsersQuery,
  ) => {
    const where = buildMembershipWhere(organizationId, query);
    const orderBy = buildMembershipOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.pageSize;

    const [members, total] = await Promise.all([
      prisma.organizationMember.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        include: membershipListInclude,
      }),
      prisma.organizationMember.count({ where }),
    ]);

    return { members, total };
  },

  findManyOptions: async (
    organizationId: string,
    query: ParsedUserOptionsQuery,
    limit: number,
  ): Promise<OrgMemberOptionRecord[]> => {
    const listQuery: MembershipListFilter = {
      search: query.search,
      status: query.status,
      teamId: query.teamId,
      teamIdIsNone: query.teamIdIsNone,
      for: query.for === "lead-assignment" ? "lead-assignment" : undefined,
      sortBy: "name",
      sortOrder: "asc",
      page: 1,
      pageSize: limit,
    };

    return prisma.organizationMember.findMany({
      where: buildMembershipWhere(organizationId, listQuery),
      select: membershipOptionsSelect,
      orderBy: { user: { name: "asc" } },
      take: limit,
    });
  },

  createWithRole: async (data: {
    organizationId: string;
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
  }): Promise<OrgMemberListRecord> => {
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

      await assignOrgMembership(tx, {
        userId: user.id,
        organizationId: data.organizationId,
        roleId: data.roleId,
      });

      return tx.organizationMember.findUniqueOrThrow({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: data.organizationId,
          },
        },
        include: membershipListInclude,
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
  ): Promise<OrgMemberListRecord | null> => {
    return prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: membershipListInclude,
    });
  },

  findMembershipByEmail: (email: string, organizationId: string) => {
    return prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
      select: { userId: true },
    });
  },

  updateStatus: async (
    userId: string,
    organizationId: string,
    status: UserStatus,
  ): Promise<OrgMemberListRecord> => {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status },
      });

      return tx.organizationMember.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        data: { status },
        include: membershipListInclude,
      });
    });
  },

  countActiveByRoleSlug: (
    organizationId: string,
    roleSlug: string,
  ): Promise<number> => {
    return prisma.organizationMember.count({
      where: {
        organizationId,
        status: UserStatus.ACTIVE,
        role: {
          slug: roleSlug,
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
