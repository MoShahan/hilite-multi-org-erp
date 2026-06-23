import { UserStatus, type Notification } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type {
  CreateNotificationInput,
  ParsedListNotificationsQuery,
} from "../types/notification";

export const notificationRepository = {
  createMany: async (inputs: CreateNotificationInput[]): Promise<void> => {
    if (inputs.length === 0) {
      return;
    }

    await prisma.notification.createMany({
      data: inputs.map((input) => ({
        organizationId: input.organizationId,
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      })),
    });
  },

  findTeamLeadUserIds: async (
    teamId: string,
    organizationId: string,
  ): Promise<string[]> => {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      select: {
        user: {
          select: {
            id: true,
            status: true,
            organizationId: true,
            userRole: {
              select: {
                role: {
                  select: { slug: true },
                },
              },
            },
          },
        },
      },
    });

    return members
      .filter(
        (member) =>
          member.user.organizationId === organizationId &&
          member.user.status === UserStatus.ACTIVE &&
          member.user.userRole?.role.slug === "team_lead",
      )
      .map((member) => member.user.id);
  },

  findPaginated: async (
    userId: string,
    organizationId: string,
    query: ParsedListNotificationsQuery,
  ): Promise<{ notifications: Notification[]; total: number }> => {
    const where = {
      userId,
      organizationId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const skip = (query.page - 1) * query.pageSize;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  },

  countUnread: (userId: string, organizationId: string): Promise<number> => {
    return prisma.notification.count({
      where: {
        userId,
        organizationId,
        readAt: null,
      },
    });
  },

  markRead: async (
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<Notification | null> => {
    const existing = await prisma.notification.findFirst({
      where: { id, userId, organizationId },
    });

    if (!existing) {
      return null;
    }

    if (existing.readAt) {
      return existing;
    }

    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  },

  markAllRead: (userId: string, organizationId: string): Promise<number> => {
    return prisma.notification
      .updateMany({
        where: {
          userId,
          organizationId,
          readAt: null,
        },
        data: { readAt: new Date() },
      })
      .then((result) => result.count);
  },
};
