import { apiClient, unwrapResponse } from "@/lib/api-client";

import type {
  ListNotificationsResult,
  Notification,
} from "./notificationsTypes";

export const notificationsService = {
  listNotifications: async (params?: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<ListNotificationsResult> => {
    const response = await apiClient.get("/api/v1/notifications", { params });
    return unwrapResponse<ListNotificationsResult>(response);
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get("/api/v1/notifications/unread-count");
    return unwrapResponse<{ count: number }>(response);
  },

  markRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch(
      `/api/v1/notifications/${notificationId}/read`,
    );
    const data = unwrapResponse<{ notification: Notification }>(response);
    return data.notification;
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const response = await apiClient.patch("/api/v1/notifications/read-all");
    return unwrapResponse<{ updated: number }>(response);
  },
};
