import { describe, expect, it } from "vitest";

import { RoleMembershipScope } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import {
  authorizeRoleDetailAccess,
  authorizeRoleListAccess,
  isTeamAssignableRole,
} from "./roleAccess";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";

const baseUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: "user-1",
  email: "lead@example.com",
  name: "Team Lead",
  phoneNumber: null,
  status: "ACTIVE",
  role: { id: "role-1", name: "Team Lead", slug: "team_lead" },
  permissions: [],
  team: { id: "team-a", name: "Team A" },
  ...overrides,
});

const executiveRole = {
  slug: "executive",
  membershipScope: RoleMembershipScope.TEAM,
};

const orgAdminRole = {
  slug: "org_admin",
  membershipScope: RoleMembershipScope.ORGANIZATION,
};

const expectForbidden = (fn: () => void) => {
  try {
    fn();
    expect.fail("Expected forbidden error");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(403);
  }
};

describe("isTeamAssignableRole", () => {
  it("returns true for executive", () => {
    expect(isTeamAssignableRole(executiveRole)).toBe(true);
  });

  it("returns false for org_admin", () => {
    expect(isTeamAssignableRole(orgAdminRole)).toBe(false);
  });
});

describe("authorizeRoleListAccess", () => {
  it("allows org admins to list without forcing team filter", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ] });

    const result = authorizeRoleListAccess(user, {});

    expect(result.assignableFrom).toBeUndefined();
  });

  it("forces team filter for team role readers", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ_TEAM] });

    const result = authorizeRoleListAccess(user, {});

    expect(result.assignableFrom).toBe("team");
  });

  it("overrides broader query for team role readers", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ_TEAM] });

    const result = authorizeRoleListAccess(user, { assignableFrom: "users" });

    expect(result.assignableFrom).toBe("team");
  });

  it("forbids callers without role read permissions", () => {
    const user = baseUser();

    expectForbidden(() => authorizeRoleListAccess(user, {}));
  });
});

describe("authorizeRoleDetailAccess", () => {
  it("allows org admins to view any role", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ] });

    expect(() =>
      authorizeRoleDetailAccess(user, orgAdminRole),
    ).not.toThrow();
  });

  it("allows team role readers to view team-assignable roles", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ_TEAM] });

    expect(() =>
      authorizeRoleDetailAccess(user, executiveRole),
    ).not.toThrow();
  });

  it("forbids team role readers from viewing org-wide roles", () => {
    const user = baseUser({ permissions: [PERMISSIONS.ROLES_READ_TEAM] });

    expectForbidden(() => authorizeRoleDetailAccess(user, orgAdminRole));
  });

  it("forbids callers without role read permissions", () => {
    const user = baseUser();

    expectForbidden(() => authorizeRoleDetailAccess(user, executiveRole));
  });
});
