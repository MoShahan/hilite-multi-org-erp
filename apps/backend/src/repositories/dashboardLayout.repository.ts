import { prisma } from "../lib/prisma";

import type { DashboardLayoutItem } from "../constants/dashboardWidgets";
import type { Prisma } from "../generated/prisma/client";

export const dashboardLayoutRepository = {
  findByUserId: (userId: string) =>
    prisma.userDashboardLayout.findUnique({
      where: { userId },
    }),

  upsert: (
    userId: string,
    view: string,
    widgets: DashboardLayoutItem[],
  ) =>
    prisma.userDashboardLayout.upsert({
      where: { userId },
      create: {
        userId,
        view,
        widgets: widgets as unknown as Prisma.InputJsonValue,
      },
      update: {
        view,
        widgets: widgets as unknown as Prisma.InputJsonValue,
      },
    }),
};
