import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTeamMemberListQuery } from "./useTeamMemberListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../teamsService", () => ({
  teamsService: {
    listMembers: vi.fn().mockResolvedValue({
      members: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useTeamMemberListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(
      () => useTeamMemberListQuery("team-1"),
      {
        route: "/?search=jane&page=2",
        preloadedState: authenticatedState(),
      },
    );

    expect(result.current.query.search).toBe("jane");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(
      () => useTeamMemberListQuery("team-1"),
      {
        route: "/?page=3",
        preloadedState: authenticatedState(),
      },
    );

    act(() => {
      result.current.patchQuery({ roleId: "role-1" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.roleId).toBe("role-1");
  });

  it("skips fetch when teamId is undefined", () => {
    const { store } = renderHookWithProviders(
      () => useTeamMemberListQuery(undefined),
      { preloadedState: authenticatedState() },
    );

    expect(store.getState().teams.membersStatus).toBe("idle");
  });

  it("dispatches fetch when teamId is provided", async () => {
    const { store } = renderHookWithProviders(
      () => useTeamMemberListQuery("team-1"),
      { preloadedState: authenticatedState() },
    );

    await vi.waitFor(() => {
      expect(store.getState().teams.membersStatus).toBe("success");
    });
  });
});
