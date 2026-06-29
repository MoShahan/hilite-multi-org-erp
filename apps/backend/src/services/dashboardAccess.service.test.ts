import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "../constants/permissions";
import { LeadStatus } from "../generated/prisma/client";
import {
  assertHasDashboardAccess,
  isClosedStatus,
  isNeedsAttentionStatus,
  resolveDashboardLeadScope,
  resolveDashboardView,
} from "./dashboardAccess.service";
import { baseAuthUser, expectAppError } from "../test/helpers";

describe("assertHasDashboardAccess", () => {
  it("allows users with any dashboard permission", () => {
    expect(() =>
      assertHasDashboardAccess(
        baseAuthUser({ permissions: [PERMISSIONS.DASHBOARD_ME] }),
      ),
    ).not.toThrow();
  });

  it("forbids users without dashboard permissions", () => {
    expectAppError(
      () => assertHasDashboardAccess(baseAuthUser()),
      403,
      "FORBIDDEN",
    );
  });
});

describe("resolveDashboardView", () => {
  it("prefers org over team and me", () => {
    const user = baseAuthUser({
      permissions: [
        PERMISSIONS.DASHBOARD_ORG,
        PERMISSIONS.DASHBOARD_TEAM,
        PERMISSIONS.DASHBOARD_ME,
      ],
    });

    expect(resolveDashboardView(user)).toBe("org");
  });

  it("returns team when org permission is missing", () => {
    const user = baseAuthUser({
      permissions: [PERMISSIONS.DASHBOARD_TEAM, PERMISSIONS.DASHBOARD_ME],
    });

    expect(resolveDashboardView(user)).toBe("team");
  });

  it("returns me when only personal dashboard permission exists", () => {
    const user = baseAuthUser({ permissions: [PERMISSIONS.DASHBOARD_ME] });

    expect(resolveDashboardView(user)).toBe("me");
  });
});

describe("resolveDashboardLeadScope", () => {
  it("scopes org view to organization only", () => {
    expect(
      resolveDashboardLeadScope(
        baseAuthUser({ permissions: [PERMISSIONS.DASHBOARD_ORG] }),
        "org-1",
        "org",
      ),
    ).toEqual({ organizationId: "org-1" });
  });

  it("scopes team view to caller team", () => {
    expect(
      resolveDashboardLeadScope(
        baseAuthUser({ permissions: [PERMISSIONS.DASHBOARD_TEAM] }),
        "org-1",
        "team",
      ),
    ).toEqual({ organizationId: "org-1", teamId: "team-a" });
  });

  it("requires team context for team view", () => {
    expectAppError(
      () =>
        resolveDashboardLeadScope(
          baseAuthUser({
            permissions: [PERMISSIONS.DASHBOARD_TEAM],
            team: null,
          }),
          "org-1",
          "team",
        ),
      403,
      "FORBIDDEN",
    );
  });

  it("scopes me view to assigned leads", () => {
    expect(
      resolveDashboardLeadScope(
        baseAuthUser({ permissions: [PERMISSIONS.DASHBOARD_ME] }),
        "org-1",
        "me",
      ),
    ).toEqual({ organizationId: "org-1", assignedToId: "user-1" });
  });
});

describe("lead status helpers", () => {
  it.each([LeadStatus.WON, LeadStatus.LOST])(
    "treats %s as closed",
    (status) => {
      expect(isClosedStatus(status)).toBe(true);
    },
  );

  it.each([LeadStatus.NEW, LeadStatus.CONTACTED])(
    "treats %s as needs attention",
    (status) => {
      expect(isNeedsAttentionStatus(status)).toBe(true);
    },
  );
});
