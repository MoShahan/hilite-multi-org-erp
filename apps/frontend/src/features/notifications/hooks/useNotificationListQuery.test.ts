import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNotificationListQuery } from "./useNotificationListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../notificationsService", () => ({
  notificationsService: {
    listNotifications: vi.fn().mockResolvedValue({
      notifications: [],
      meta: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        unreadCount: 0,
      },
    }),
  },
}));

describe("useNotificationListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useNotificationListQuery(), {
      route: "/?filter=unread&page=2",
      preloadedState: authenticatedState({ modules: ["notifications"] }),
    });

    expect(result.current.query.filter).toBe("unread");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filter changes via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useNotificationListQuery(), {
      route: "/?page=3",
      preloadedState: authenticatedState({ modules: ["notifications"] }),
    });

    act(() => {
      result.current.patchQuery({ filter: "unread" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.filter).toBe("unread");
  });

  it("skips fetch when notifications module is disabled", () => {
    const { store } = renderHookWithProviders(() => useNotificationListQuery(), {
      preloadedState: authenticatedState({ modules: [] }),
    });

    expect(store.getState().notifications.listStatus).toBe("idle");
  });

  it("dispatches fetch when notifications module is enabled", async () => {
    const { store } = renderHookWithProviders(() => useNotificationListQuery(), {
      preloadedState: authenticatedState({ modules: ["notifications"] }),
    });

    await vi.waitFor(() => {
      expect(store.getState().notifications.listStatus).toBe("success");
    });
  });
});
