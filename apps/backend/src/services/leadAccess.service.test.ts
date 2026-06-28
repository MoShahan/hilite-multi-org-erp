import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {},
}));

import { PERMISSIONS } from "../constants/permissions";
import { LeadStatus } from "../generated/prisma/client";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";
import {
  assertCanCreateActivity,
  assertCanReassignLead,
  assertCanWriteLead,
} from "./leadAccess.service";

const orgId = "org-1";
const teamId = "team-a";
const userId = "user-1";

const baseUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: userId,
  email: "lead@example.com",
  name: "Team Lead",
  phoneNumber: null,
  status: "ACTIVE",
  organizationId: orgId,
  role: { id: "role-1", name: "Team Lead", slug: "team_lead" },
  permissions: [],
  team: { id: teamId, name: "Team A" },
  ...overrides,
});

const baseLead = (status: LeadStatus = LeadStatus.NEGOTIATION) => ({
  id: "lead-1",
  organizationId: orgId,
  teamId,
  assignedToId: userId,
  status,
});

const expectBadRequest = (fn: () => void) => {
  try {
    fn();
    expect.fail("Expected bad request error");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(400);
    expect((error as AppError).message).toBe(
      "This lead is closed and cannot be modified",
    );
  }
};

describe("closed lead guards", () => {
  const writeUser = baseUser({
    permissions: [PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_TEAM],
  });

  const activityUser = baseUser({
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
