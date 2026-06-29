import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUserListQuery } from "./useUserListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../usersService", () => ({
  usersService: {
    listUsers: vi.fn().mockResolvedValue({
      users: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useUserListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useUserListQuery(), {
      route: "/?search=jane&page=2",
      preloadedState: authenticatedState(),
    });

    expect(result.current.query.search).toBe("jane");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useUserListQuery(), {
      route: "/?page=3",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.patchQuery({ search: "jane" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.search).toBe("jane");
  });

  it("does not reset page when only page changes", () => {
    const { result } = renderHookWithProviders(() => useUserListQuery(), {
      route: "/?page=2",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.patchQuery({ page: 4 });
    });

    expect(result.current.query.page).toBe(4);
  });

  it("clears active filters", () => {
    const { result } = renderHookWithProviders(() => useUserListQuery(), {
      route: "/?search=jane&roleId=role-1",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.query.search).toBe("");
    expect(result.current.query.roleId).toBe("");
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => useUserListQuery(), {
      preloadedState: authenticatedState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().users.listStatus).toBe("success");
    });
  });
});
