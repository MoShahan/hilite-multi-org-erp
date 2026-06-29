import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTeamListQuery } from "./useTeamListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../teamsService", () => ({
  teamsService: {
    listTeams: vi.fn().mockResolvedValue({
      teams: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useTeamListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useTeamListQuery(), {
      route: "/?search=alpha&page=2",
      preloadedState: authenticatedState(),
    });

    expect(result.current.query.search).toBe("alpha");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useTeamListQuery(), {
      route: "/?page=3",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.patchQuery({ membership: "WITH_MEMBERS" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.membership).toBe("WITH_MEMBERS");
  });

  it("does not reset page when only page changes", () => {
    const { result } = renderHookWithProviders(() => useTeamListQuery(), {
      route: "/?page=2",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.patchQuery({ page: 4 });
    });

    expect(result.current.query.page).toBe(4);
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => useTeamListQuery(), {
      preloadedState: authenticatedState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().teams.listStatus).toBe("success");
    });
  });
});
