import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePlatformUserListQuery } from "./usePlatformUserListQuery";
import { platformAdminState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../platformService", () => ({
  platformService: {
    listPlatformUsers: vi.fn().mockResolvedValue({
      users: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("usePlatformUserListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => usePlatformUserListQuery(), {
      route: "/?search=jane&page=2",
      preloadedState: platformAdminState(),
    });

    expect(result.current.query.search).toBe("jane");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => usePlatformUserListQuery(), {
      route: "/?page=3",
      preloadedState: platformAdminState(),
    });

    act(() => {
      result.current.patchQuery({ status: "ACTIVE" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.status).toBe("ACTIVE");
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => usePlatformUserListQuery(), {
      preloadedState: platformAdminState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().platform.platformUsersListStatus).toBe("success");
    });
  });
});
