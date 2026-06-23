import type { Notification } from "../generated/prisma/client";
import { notificationRepository } from "../repositories/notification.repository";
import type {
  CreateNotificationInput,
  ListNotificationsQuery,
  PaginatedNotificationsResponse,
  ParsedListNotificationsQuery,
  UnreadCountResponse,
} from "../types/notification";
import { AppError } from "../utils/AppError";

const DEFAULT_LIST_QUERY = {
  unreadOnly: false,
  page: 1,
  pageSize: 20,
};

const parseQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(parseQueryValue(value) ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseBoolean = (value: unknown): boolean => {
  const raw = parseQueryValue(value)?.toLowerCase();
  return raw === "true" || raw === "1";
};

const parseListQuery = (
  rawQuery: Record<string, unknown>,
): ParsedListNotificationsQuery => ({
  unreadOnly: parseBoolean(rawQuery.unreadOnly),
  page: parsePositiveInt(rawQuery.page, DEFAULT_LIST_QUERY.page),
  pageSize: Math.min(
    100,
    parsePositiveInt(rawQuery.pageSize, DEFAULT_LIST_QUERY.pageSize),
  ),
});

const toNotificationResponse = (notification: Notification) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  body: notification.body,
  entityType: notification.entityType,
  entityId: notification.entityId,
  readAt: notification.readAt?.toISOString() ?? null,
  createdAt: notification.createdAt.toISOString(),
});

const requireOrgContext = (
  organizationId: string | null | undefined,
): string | null => {
  if (!organizationId) {
    return null;
  }

  return organizationId;
};

export const notificationService = {
  createMany: async (inputs: CreateNotificationInput[]): Promise<void> => {
    await notificationRepository.createMany(inputs);
  },

  listNotifications: async (
    userId: string,
    organizationId: string | null | undefined,
    rawQuery: Record<string, unknown>,
  ): Promise<PaginatedNotificationsResponse> => {
    const orgId = requireOrgContext(organizationId);

    if (!orgId) {
      return {
        notifications: [],
        meta: {
          page: 1,
          pageSize: DEFAULT_LIST_QUERY.pageSize,
          total: 0,
          totalPages: 1,
          unreadCount: 0,
        },
      };
    }

    const query = parseListQuery(rawQuery);
    const [{ notifications, total }, unreadCount] = await Promise.all([
      notificationRepository.findPaginated(userId, orgId, query),
      notificationRepository.countUnread(userId, orgId),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

    return {
      notifications: notifications.map(toNotificationResponse),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
        unreadCount,
      },
    };
  },

  getUnreadCount: async (
    userId: string,
    organizationId: string | null | undefined,
  ): Promise<UnreadCountResponse> => {
    const orgId = requireOrgContext(organizationId);

    if (!orgId) {
      return { count: 0 };
    }

    const count = await notificationRepository.countUnread(userId, orgId);
    return { count };
  },

  markRead: async (
    userId: string,
    organizationId: string | null | undefined,
    notificationId: string,
  ) => {
    const orgId = requireOrgContext(organizationId);

    if (!orgId) {
      throw AppError.notFound("Notification not found");
    }

    const notification = await notificationRepository.markRead(
      notificationId,
      userId,
      orgId,
    );

    if (!notification) {
      throw AppError.notFound("Notification not found");
    }

    return toNotificationResponse(notification);
  },

  markAllRead: async (
    userId: string,
    organizationId: string | null | undefined,
  ): Promise<{ updated: number }> => {
    const orgId = requireOrgContext(organizationId);

    if (!orgId) {
      return { updated: 0 };
    }

    const updated = await notificationRepository.markAllRead(userId, orgId);
    return { updated };
  },
};

export type { ListNotificationsQuery };
