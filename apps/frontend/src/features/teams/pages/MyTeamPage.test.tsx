import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MyTeamPage } from "./MyTeamPage";
import { mockUser } from "@/test/fixtures/auth";
import { renderWithProviders } from "@/test/render";

describe("MyTeamPage", () => {
  it("shows add member button when user has users:write:team", () => {
    renderWithProviders(<MyTeamPage />, {
      preloadedState: {
        auth: {
          user: mockUser({
            permissions: ["users:read:team", "users:write:team"],
            team: { id: "team-a", name: "Team A" },
          }),
          organization: {
            id: "org-1",
            name: "Test Org",
            code: "TEST",
            status: "ACTIVE",
          },
          modules: [],
          status: "authenticated",
        },
        teams: {
          teams: [],
          listMeta: null,
          listStatus: "idle",
          listError: null,
          selectedTeam: null,
          detailStatus: "idle",
          detailError: null,
          members: [],
          membersMeta: null,
          membersStatus: "idle",
          membersError: null,
          mutationStatus: "idle",
        },
      },
    });

    expect(screen.getByRole("button", { name: /add member/i })).toBeInTheDocument();
  });

  it("hides add member button without users:write:team", () => {
    renderWithProviders(<MyTeamPage />, {
      preloadedState: {
        auth: {
          user: mockUser({
            permissions: ["users:read:team"],
            team: { id: "team-a", name: "Team A" },
          }),
          organization: {
            id: "org-1",
            name: "Test Org",
            code: "TEST",
            status: "ACTIVE",
          },
          modules: [],
          status: "authenticated",
        },
        teams: {
          teams: [],
          listMeta: null,
          listStatus: "idle",
          listError: null,
          selectedTeam: null,
          detailStatus: "idle",
          detailError: null,
          members: [],
          membersMeta: null,
          membersStatus: "idle",
          membersError: null,
          mutationStatus: "idle",
        },
      },
    });

    expect(
      screen.queryByRole("button", { name: /add member/i }),
    ).not.toBeInTheDocument();
  });
});
