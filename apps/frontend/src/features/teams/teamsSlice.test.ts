import { describe, expect, it, vi } from "vitest";

import {
  clearSelectedTeam,
  createTeam,
  fetchTeam,
  fetchTeamMembers,
  fetchTeams,
  teamsReducer,
} from "./teamsSlice";
import { DEFAULT_LIST_QUERY } from "./teamListParams";
import { DEFAULT_MEMBER_LIST_QUERY } from "./teamMemberListParams";

import type { Team, TeamMember } from "./teamsTypes";

vi.mock("./teamsService", () => ({
  teamsService: {
    listTeams: vi.fn(),
    getTeam: vi.fn(),
    listMembers: vi.fn(),
    createTeam: vi.fn(),
    createMember: vi.fn(),
  },
}));

const mockTeam = (overrides?: Partial<Team>): Team => ({
  id: "team-1",
  name: "Sales",
  memberCount: 2,
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

const mockMember = (overrides?: Partial<TeamMember>): TeamMember => ({
  id: "user-1",
  email: "user@example.com",
  name: "Member One",
  status: "ACTIVE",
  role: { id: "role-1", name: "Executive", slug: "executive" },
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("teamsSlice", () => {
  it("tracks list loading and success", () => {
    const loading = teamsReducer(undefined, fetchTeams.pending("", DEFAULT_LIST_QUERY));
    expect(loading.listStatus).toBe("loading");

    const success = teamsReducer(
      loading,
      fetchTeams.fulfilled(
        {
          teams: [mockTeam()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        DEFAULT_LIST_QUERY,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.teams).toHaveLength(1);
  });

  it("loads and clears selected team", () => {
    const team = mockTeam();
    const success = teamsReducer(
      teamsReducer(undefined, fetchTeam.pending("", "team-1")),
      fetchTeam.fulfilled(team, "", "team-1"),
    );

    expect(success.selectedTeam).toEqual(team);

    const cleared = teamsReducer(success, clearSelectedTeam());
    expect(cleared.selectedTeam).toBeNull();
    expect(cleared.members).toEqual([]);
  });

  it("loads team members", () => {
    const state = teamsReducer(
      teamsReducer(
        undefined,
        fetchTeamMembers.pending("", {
          teamId: "team-1",
          query: DEFAULT_MEMBER_LIST_QUERY,
        }),
      ),
      fetchTeamMembers.fulfilled(
        {
          members: [mockMember()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        { teamId: "team-1", query: DEFAULT_MEMBER_LIST_QUERY },
      ),
    );

    expect(state.membersStatus).toBe("success");
    expect(state.members).toHaveLength(1);
  });

  it("tracks create team mutation lifecycle", () => {
    const pending = teamsReducer(
      undefined,
      createTeam.pending("", { name: "New Team" }),
    );
    expect(pending.mutationStatus).toBe("loading");

    const fulfilled = teamsReducer(
      pending,
      createTeam.fulfilled(mockTeam({ name: "New Team" }), "", {
        name: "New Team",
      }),
    );
    expect(fulfilled.mutationStatus).toBe("idle");
  });

  it("stores list errors", () => {
    const state = teamsReducer(
      { ...teamsReducer(undefined, { type: "@@INIT" }), listStatus: "loading" },
      fetchTeams.rejected(new Error("Failed"), "", DEFAULT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Failed");
  });
});
