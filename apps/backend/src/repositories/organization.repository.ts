import {
  OrganizationStatus,
  UserStatus,
  type Organization,
  type Prisma,
} from "../generated/prisma/client";
import { assignOrgMembershipBySlug } from "../lib/orgMembership";
import { prisma } from "../lib/prisma";
import { seedDefaultRolesForOrg } from "../lib/roleSeeding";
import { seedDefaultModulesForOrg } from "../lib/seedOrganizationModules";

import type {
  OrganizationListSortBy,
  OrganizationListSortOrder,
  ParsedListOrganizationsQuery,
} from "../types/organization";

const organizationWithUserCount = {
  include: {
    _count: {
      select: { members: true },
    },
  },
} as const;

export type OrganizationWithUserCount = Organization & {
  _count: { members: number };
};

const buildWhere = (
  query: ParsedListOrganizationsQuery,
): Prisma.OrganizationWhereInput => {
  const where: Prisma.OrganizationWhereInput = {};

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const buildOrderBy = (
  sortBy: OrganizationListSortBy,
  sortOrder: OrganizationListSortOrder,
): Prisma.OrganizationOrderByWithRelationInput => {
  if (sortBy === "userCount") {
    return { members: { _count: sortOrder } };
  }

  return { [sortBy]: sortOrder };
};

export const organizationRepository = {
  findManyPaginated: async (query: ParsedListOrganizationsQuery) => {
    const where = buildWhere(query);
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.pageSize;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        ...organizationWithUserCount,
      }),
      prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  },

  findManyOptions: (
    status?: ParsedListOrganizationsQuery["status"],
    limit = 100,
  ) => {
    const where: Prisma.OrganizationWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    return prisma.organization.findMany({
      where,
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
      take: limit,
    });
  },

  findMany: (): Promise<OrganizationWithUserCount[]> => {
    return prisma.organization.findMany({
      ...organizationWithUserCount,
      orderBy: { createdAt: "desc" },
    });
  },

  findById: (id: string): Promise<OrganizationWithUserCount | null> => {
    return prisma.organization.findUnique({
      where: { id },
      ...organizationWithUserCount,
    });
  },

  findByCode: (code: string): Promise<Organization | null> => {
    return prisma.organization.findUnique({
      where: { code },
    });
  },

  createWithOrgAdmin: (data: {
    organization: {
      name: string;
      code: string;
      description?: string | null;
      logoUrl?: string | null;
    };
    orgAdmin: {
      name: string;
      email: string;
      passwordHash: string;
    };
  }): Promise<OrganizationWithUserCount> => {
    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          code: data.organization.code,
          description: data.organization.description ?? null,
          logoUrl: data.organization.logoUrl ?? null,
          status: OrganizationStatus.ACTIVE,
        },
      });

      await seedDefaultRolesForOrg(tx, organization.id);
      await seedDefaultModulesForOrg(tx, organization.id);

      const orgAdminUser = await tx.user.create({
        data: {
          name: data.orgAdmin.name,
          email: data.orgAdmin.email,
          passwordHash: data.orgAdmin.passwordHash,
          mustChangePassword: true,
          status: UserStatus.ACTIVE,
        },
      });

      await assignOrgMembershipBySlug(
        tx,
        orgAdminUser.id,
        organization.id,
        "org_admin",
      );

      return tx.organization.findUniqueOrThrow({
        where: { id: organization.id },
        ...organizationWithUserCount,
      });
    });
  },

  update: (
    id: string,
    data: Prisma.OrganizationUpdateInput,
  ): Promise<OrganizationWithUserCount> => {
    return prisma.organization.update({
      where: { id },
      data,
      ...organizationWithUserCount,
    });
  },

  updateStatus: (
    id: string,
    status: OrganizationStatus,
  ): Promise<OrganizationWithUserCount> => {
    return prisma.organization.update({
      where: { id },
      data: { status },
      ...organizationWithUserCount,
    });
  },
};
