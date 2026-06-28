import type { NotificationType } from "../generated/prisma/client";

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount: number;
};

export type PaginatedNotificationsResponse = {
  notifications: NotificationResponse[];
  meta: NotificationListMeta;
};

export type UnreadCountResponse = {
  count: number;
};

export type ListNotificationsQuery = {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export type ParsedListNotificationsQuery = {
  unreadOnly: boolean;
  page: number;
  pageSize: number;
};

export type CreateNotificationInput = {
  organizationId?: string | null;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
};
