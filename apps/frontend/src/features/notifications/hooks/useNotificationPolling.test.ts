import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useNotificationPolling } from "./useNotificationPolling";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../notificationsService", () => ({
  notificationsService: {
    getUnreadCount: vi.fn().mockResolvedValue({ count: 0 }),
  },
}));

describe("useNotificationPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not poll when notifications module is disabled", () => {
    const { store } = renderHookWithProviders(() => useNotificationPolling(), {
      preloadedState: authenticatedState({ modules: [] }),
    });

    vi.advanceTimersByTime(120_000);

    expect(store.getState().notifications.unreadStatus).toBe("idle");
  });

  it("polls unread count when authenticated with notifications module", async () => {
    const { store } = renderHookWithProviders(() => useNotificationPolling(), {
      preloadedState: authenticatedState({
        modules: ["notifications"],
        status: "authenticated",
      }),
    });

    vi.advanceTimersByTime(60_000);

    await vi.waitFor(() => {
      expect(store.getState().notifications.unreadStatus).toBe("success");
    });
  });
});
