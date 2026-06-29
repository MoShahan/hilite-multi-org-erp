import { prisma } from "../lib/prisma";

import type { Prisma } from "../generated/prisma/client";
import type { ParsedListActivitiesQuery } from "../types/activity";

const activityInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export type ActivityRecord = Prisma.ActivityGetPayload<{
  include: typeof activityInclude;
}>;

export const activityRepository = {
  findManyPaginated: async (
    leadId: string,
    query: ParsedListActivitiesQuery,
  ) => {
    const where = { leadId };
    const skip = (query.page - 1) * query.pageSize;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
        include: activityInclude,
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  },

  create: (data: {
    leadId: string;
    type: ActivityRecord["type"];
    notes: string;
    createdById: string;
  }): Promise<ActivityRecord> => {
    return prisma.activity.create({
      data,
      include: activityInclude,
    });
  },
};
