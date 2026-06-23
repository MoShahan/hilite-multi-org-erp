import { LeadStatus, type Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const recentActivityInclude = {
  lead: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export const dashboardRepository = {
  countLeads: (where: Prisma.LeadWhereInput) =>
    prisma.lead.count({ where }),

  countUnassignedLeads: (where: Prisma.LeadWhereInput) =>
    prisma.lead.count({
      where: { ...where, assignedToId: null },
    }),

  countLeadsByStatuses: (
    where: Prisma.LeadWhereInput,
    statuses: LeadStatus[],
  ) =>
    prisma.lead.count({
      where: { ...where, status: { in: statuses } },
    }),

  groupLeadsByStatus: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),

  groupLeadsByAssigneeAndStatus: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({
      by: ["assignedToId", "status"],
      where,
      _count: { _all: true },
    }),

  groupLeadsByTeamAndStatus: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({
      by: ["teamId", "status"],
      where,
      _count: { _all: true },
    }),

  countActivities: (leadWhere: Prisma.LeadWhereInput) =>
    prisma.activity.count({
      where: { lead: leadWhere },
    }),

  findRecentActivities: (leadWhere: Prisma.LeadWhereInput, take = 10) =>
    prisma.activity.findMany({
      where: { lead: leadWhere },
      orderBy: { createdAt: "desc" },
      take,
      include: recentActivityInclude,
    }),

  findUsersByIds: (userIds: string[]) =>
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    }),

  findTeamsByIds: (teamIds: string[]) =>
    prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    }),
};
