import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {},
}));

import { PERMISSIONS } from "../constants/permissions";
import { LeadStatus } from "../generated/prisma/client";
import {
  assertCanCreateActivity,
  assertCanReadLead,
  assertCanReassignLead,
  assertCanUpdateLeadStatus,
  assertCanWriteLead,
  getCallerTeamId,
  resolveCreateTeamId,
  resolveLeadListScope,
} from "./leadAccess.service";
import { baseAuthUser, expectAppError } from "../test/helpers";

const orgId = "org-1";
const teamId = "team-a";
const userId = "user-1";

const baseLead = (status: LeadStatus = LeadStatus.NEGOTIATION) => ({
  id: "lead-1",
  organizationId: orgId,
  teamId,
  assignedToId: userId,
  status,
});

const expectBadRequest = (fn: () => void) => {
  expectAppError(fn, 400, "BAD_REQUEST");
};

describe("getCallerTeamId", () => {
  it("returns team id when present", () => {
    expect(getCallerTeamId(baseAuthUser())).toBe(teamId);
  });

  it("returns null when team is missing", () => {
    expect(getCallerTeamId(baseAuthUser({ team: null }))).toBeNull();
  });
});

describe("resolveLeadListScope", () => {
  it("scopes org readers to organization", () => {
    expect(
      resolveLeadListScope(
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_ORG] }),
        orgId,
      ),
    ).toEqual({ organizationId: orgId });
  });

  it("scopes team readers to caller team", () => {
    expect(
      resolveLeadListScope(
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_TEAM] }),
        orgId,
      ),
    ).toEqual({ organizationId: orgId, teamId });
  });

  it("scopes individual readers to assigned leads", () => {
    expect(
      resolveLeadListScope(
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ] }),
        orgId,
      ),
    ).toEqual({ organizationId: orgId, assignedToId: userId });
  });
});

describe("assertCanReadLead", () => {
  it("allows org readers", () => {
    expect(() =>
      assertCanReadLead(
        baseLead(),
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_ORG] }),
        orgId,
      ),
    ).not.toThrow();
  });

  it("forbids team readers from other teams", () => {
    expectAppError(
      () =>
        assertCanReadLead(
          { ...baseLead(), teamId: "other-team" },
          baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_TEAM] }),
          orgId,
        ),
      403,
      "FORBIDDEN",
    );
  });
});

describe("resolveCreateTeamId", () => {
  it("returns caller team for team writers", () => {
    expect(
      resolveCreateTeamId(
        baseAuthUser({
          permissions: [PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_TEAM],
        }),
        undefined,
      ),
    ).toBe(teamId);
  });

  it("requires team id for org writers", () => {
    expectAppError(
      () =>
        resolveCreateTeamId(
          baseAuthUser({
            permissions: [PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_ORG],
          }),
          undefined,
        ),
      400,
      "BAD_REQUEST",
    );
  });
});

describe("assertCanUpdateLeadStatus", () => {
  it("allows team status writers on their team lead", () => {
    expect(() =>
      assertCanUpdateLeadStatus(
        baseLead(),
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_STATUS_WRITE_TEAM] }),
        orgId,
      ),
    ).not.toThrow();
  });

  it("allows assignees with personal status permission", () => {
    expect(() =>
      assertCanUpdateLeadStatus(
        baseLead(),
        baseAuthUser({ permissions: [PERMISSIONS.LEADS_STATUS_WRITE] }),
        orgId,
      ),
    ).not.toThrow();
  });
});

describe("closed lead guards", () => {
  const writeUser = baseAuthUser({
    id: userId,
    permissions: [PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_TEAM],
  });

  const activityUser = baseAuthUser({
    id: userId,
    permissions: [PERMISSIONS.ACTIVITIES_WRITE],
  });

  describe("assertCanWriteLead", () => {
    it.each([LeadStatus.WON, LeadStatus.LOST])(
      "rejects %s leads",
      (status) => {
        expectBadRequest(() =>
          assertCanWriteLead(baseLead(status), writeUser, orgId),
        );
      },
    );

    it("allows open leads with permission", () => {
      expect(() =>
        assertCanWriteLead(baseLead(LeadStatus.NEGOTIATION), writeUser, orgId),
      ).not.toThrow();
    });
  });

  describe("assertCanReassignLead", () => {
    it.each([LeadStatus.WON, LeadStatus.LOST])(
      "rejects %s leads",
      (status) => {
        expectBadRequest(() =>
          assertCanReassignLead(baseLead(status), writeUser, orgId),
        );
      },
    );

    it("allows open leads with permission", () => {
      expect(() =>
        assertCanReassignLead(
          baseLead(LeadStatus.NEGOTIATION),
          writeUser,
          orgId,
        ),
      ).not.toThrow();
    });
  });

  describe("assertCanCreateActivity", () => {
    it.each([LeadStatus.WON, LeadStatus.LOST])(
      "rejects %s leads",
      (status) => {
        expectBadRequest(() =>
          assertCanCreateActivity(baseLead(status), activityUser),
        );
      },
    );

    it("allows open leads for the current assignee", () => {
      expect(() =>
        assertCanCreateActivity(
          baseLead(LeadStatus.NEGOTIATION),
          activityUser,
        ),
      ).not.toThrow();
    });
  });
});
