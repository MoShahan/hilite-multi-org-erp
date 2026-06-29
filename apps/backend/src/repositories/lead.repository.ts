import { LeadStatus, type Prisma } from "../generated/prisma/client";
import { sortLeadRowsByStatus } from "../lib/leadStatusSort";
import { prisma } from "../lib/prisma";

import type { ParsedListLeadsQuery } from "../types/lead";

const leadInclude = {
  team: {
    select: {
      id: true,
      name: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export type LeadRecord = Prisma.LeadGetPayload<{
  include: typeof leadInclude;
}>;

type ListScope = {
  organizationId: string;
  teamId?: string;
  assignedToId?: string;
};

const buildWhere = (
  scope: ListScope,
  query: ParsedListLeadsQuery,
): Prisma.LeadWhereInput => {
  const where: Prisma.LeadWhereInput = {
    organizationId: scope.organizationId,
  };

  if (scope.teamId) {
    where.teamId = scope.teamId;
  }

  if (scope.assignedToId) {
    where.assignedToId = scope.assignedToId;
  }

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.teamId) {
    where.teamId = query.teamId;
  }

  if (query.assignedToUnassigned) {
    where.assignedToId = null;
  } else if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { mobileNumber: { contains: query.search, mode: "insensitive" } },
      { project: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const buildOrderBy = (
  sortBy: ParsedListLeadsQuery["sortBy"],
  sortOrder: ParsedListLeadsQuery["sortOrder"],
): Prisma.LeadOrderByWithRelationInput | Prisma.LeadOrderByWithRelationInput[] => {
  if (sortBy === "team") {
    return { team: { name: sortOrder } };
  }

  if (sortBy === "assignee") {
    return { assignedTo: { name: sortOrder } };
  }

  return { [sortBy]: sortOrder };
};

export const leadRepository = {
  findManyPaginated: async (scope: ListScope, query: ParsedListLeadsQuery) => {
    const where = buildWhere(scope, query);
    const skip = (query.page - 1) * query.pageSize;

    if (query.sortBy === "status") {
      const [statusRows, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          select: { id: true, status: true },
        }),
        prisma.lead.count({ where }),
      ]);

      const pageIds = sortLeadRowsByStatus(
        statusRows,
        query.sortOrder,
        skip,
        query.pageSize,
      );

      if (pageIds.length === 0) {
        return { leads: [], total };
      }

      const leads = await prisma.lead.findMany({
        where: { id: { in: pageIds } },
        include: leadInclude,
      });

      const leadById = new Map(leads.map((lead) => [lead.id, lead]));
      const orderedLeads = pageIds.map((id) => leadById.get(id)!);

      return { leads: orderedLeads, total };
    }

    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        include: leadInclude,
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  },

  findByIdForOrganization: (
    leadId: string,
    organizationId: string,
  ): Promise<LeadRecord | null> => {
    return prisma.lead.findFirst({
      where: { id: leadId, organizationId },
      include: leadInclude,
    });
  },

  create: (data: {
    organizationId: string;
    teamId: string;
    assignedToId?: string | null;
    name: string;
    mobileNumber?: string | null;
    email?: string | null;
    source?: string | null;
    project?: string | null;
    createdById: string;
  }): Promise<LeadRecord> => {
    return prisma.lead.create({
      data: {
        organizationId: data.organizationId,
        teamId: data.teamId,
        assignedToId: data.assignedToId ?? null,
        name: data.name,
        mobileNumber: data.mobileNumber ?? null,
        email: data.email ?? null,
        source: data.source ?? null,
        project: data.project ?? null,
        status: LeadStatus.NEW,
        createdById: data.createdById,
      },
      include: leadInclude,
    });
  },

  update: (
    leadId: string,
    data: {
      name?: string;
      mobileNumber?: string | null;
      email?: string | null;
      source?: string | null;
      project?: string | null;
      status?: LeadStatus;
    },
  ): Promise<LeadRecord> => {
    return prisma.lead.update({
      where: { id: leadId },
      data,
      include: leadInclude,
    });
  },

  assign: (
    leadId: string,
    assignedToId: string | null,
  ): Promise<LeadRecord> => {
    return prisma.lead.update({
      where: { id: leadId },
      data: { assignedToId },
      include: leadInclude,
    });
  },

  findTeamInOrganization: (teamId: string, organizationId: string) => {
    return prisma.team.findFirst({
      where: { id: teamId, organizationId },
      select: { id: true },
    });
  },
};
