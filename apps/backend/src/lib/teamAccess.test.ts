import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "../constants/permissions";
import { authorizeTeamMemberAccess } from "./teamAccess";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";

const baseUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: "user-1",
  email: "lead@example.com",
  name: "Team Lead",
  phoneNumber: null,
  status: "ACTIVE",
  organizationId: "org-1",
  role: { id: "role-1", name: "Team Lead", slug: "team_lead" },
  permissions: [],
  team: { id: "team-a", name: "Team A" },
  ...overrides,
});

const expectForbidden = (fn: () => void) => {
  try {
    fn();
    expect.fail("Expected forbidden error");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(403);
  }
};

describe("authorizeTeamMemberAccess", () => {
  describe("read", () => {
    it("allows org admins with teams:read for any team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.TEAMS_READ] });

      expect(() =>
        authorizeTeamMemberAccess(user, "team-b", "read"),
      ).not.toThrow();
    });

    it("allows team leads to read their own team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_READ_TEAM] });

      expect(() =>
        authorizeTeamMemberAccess(user, "team-a", "read"),
      ).not.toThrow();
    });

    it("forbids team leads from reading another team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_READ_TEAM] });

      expectForbidden(() =>
        authorizeTeamMemberAccess(user, "team-b", "read"),
      );
    });

    it("forbids team leads without team context", () => {
      const user = baseUser({
        permissions: [PERMISSIONS.USERS_READ_TEAM],
        team: null,
      });

      expectForbidden(() =>
        authorizeTeamMemberAccess(user, "team-a", "read"),
      );
    });
  });

  describe("write", () => {
    it("allows org admins with teams:write for any team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.TEAMS_WRITE] });

      expect(() =>
        authorizeTeamMemberAccess(user, "team-b", "write"),
      ).not.toThrow();
    });

    it("allows org admins with users:write for any team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_WRITE] });

      expect(() =>
        authorizeTeamMemberAccess(user, "team-b", "write"),
      ).not.toThrow();
    });

    it("allows team leads with users:write:team on their own team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_WRITE_TEAM] });

      expect(() =>
        authorizeTeamMemberAccess(user, "team-a", "write"),
      ).not.toThrow();
    });

    it("forbids team leads from writing to another team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_WRITE_TEAM] });

      expectForbidden(() =>
        authorizeTeamMemberAccess(user, "team-b", "write"),
      );
    });

    it("forbids team leads without users:write:team", () => {
      const user = baseUser({ permissions: [PERMISSIONS.USERS_READ_TEAM] });

      expectForbidden(() =>
        authorizeTeamMemberAccess(user, "team-a", "write"),
      );
    });
  });
});
