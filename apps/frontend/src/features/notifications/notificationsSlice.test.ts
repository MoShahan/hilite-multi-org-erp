import { describe, expect, it, vi } from "vitest";

import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsReducer,
} from "./notificationsSlice";
import { DEFAULT_LIST_QUERY } from "./notificationListParams";

import type { Notification } from "./notificationsTypes";

vi.mock("./notificationsService", () => ({
  notificationsService: {
    listNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}));

const mockNotification = (
  overrides?: Partial<Notification>,
): Notification => ({
  id: "notification-1",
  type: "LEAD_ASSIGNED",
  title: "Lead assigned",
  body: "You were assigned a lead",
  entityType: "lead",
  entityId: "lead-1",
  readAt: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("notificationsSlice", () => {
  it("tracks list loading and success", () => {
    const loading = notificationsReducer(
      undefined,
      fetchNotifications.pending("", DEFAULT_LIST_QUERY),
    );
    expect(loading.listStatus).toBe("loading");
    expect(loading.listQuery).toEqual(DEFAULT_LIST_QUERY);

    const success = notificationsReducer(
      loading,
      fetchNotifications.fulfilled(
        {
          notifications: [mockNotification()],
          meta: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1,
            unreadCount: 1,
          },
        },
        "",
        DEFAULT_LIST_QUERY,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.unreadCount).toBe(1);
    expect(success.lastFetchedAt).toBeTruthy();
  });

  it("updates unread count", () => {
    const state = notificationsReducer(
      notificationsReducer(undefined, fetchUnreadCount.pending("")),
      fetchUnreadCount.fulfilled({ count: 3 }, "", undefined),
    );

    expect(state.unreadStatus).toBe("success");
    expect(state.unreadCount).toBe(3);
  });

  it("decrements unread count when marking a notification read", () => {
    const unread = mockNotification({ readAt: null });
    const read = mockNotification({
      readAt: "2026-06-02T00:00:00.000Z",
    });
    const initial = {
      ...notificationsReducer(undefined, { type: "@@INIT" }),
      notifications: [unread],
      unreadCount: 1,
      mutationStatus: "loading" as const,
    };

    const state = notificationsReducer(
      initial,
      markNotificationRead.fulfilled(read, "", "notification-1"),
    );

    expect(state.notifications[0]?.readAt).toBeTruthy();
    expect(state.unreadCount).toBe(0);
    expect(state.mutationStatus).toBe("idle");
  });

  it("marks all notifications read", () => {
    const initial = {
      ...notificationsReducer(undefined, { type: "@@INIT" }),
      notifications: [mockNotification(), mockNotification({ id: "n-2" })],
      unreadCount: 2,
      mutationStatus: "loading" as const,
    };

    const state = notificationsReducer(
      initial,
      markAllNotificationsRead.fulfilled({ updated: 2 }, "", undefined),
    );

    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every((notification) => notification.readAt)).toBe(
      true,
    );
    expect(state.mutationStatus).toBe("idle");
  });

  it("stores list errors", () => {
    const state = notificationsReducer(
      {
        ...notificationsReducer(undefined, { type: "@@INIT" }),
        listStatus: "loading",
      },
      fetchNotifications.rejected(new Error("Failed"), "", DEFAULT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Failed");
  });
});
