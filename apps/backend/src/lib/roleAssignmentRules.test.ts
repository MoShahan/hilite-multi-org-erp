import { describe, expect, it } from "vitest";

import { RoleMembershipScope } from "../generated/prisma/client";
import {
  assertRoleAssignableFrom,
  getRoleAssignmentRules,
  getRoleAssignmentRulesBySlug,
  listDefaultAssignableSlugs,
} from "./roleAssignmentRules";

describe("getRoleAssignmentRulesBySlug", () => {
  it("returns default rules for known org roles", () => {
    const rules = getRoleAssignmentRulesBySlug("executive");

    expect(rules).toEqual({
      membershipScope: "team",
      requiresTeamMembership: true,
      assignableFrom: ["team"],
    });
  });

  it("returns custom defaults for unknown slugs", () => {
    const rules = getRoleAssignmentRulesBySlug("custom_role");

    expect(rules).toEqual({
      membershipScope: "organization",
      requiresTeamMembership: false,
      assignableFrom: ["users", "team"],
    });
  });
});

describe("getRoleAssignmentRules", () => {
  it("prefers default role definition when slug matches", () => {
    const rules = getRoleAssignmentRules({
      slug: "org_admin",
      membershipScope: RoleMembershipScope.TEAM,
    });

    expect(rules.membershipScope).toBe("organization");
    expect(rules.assignableFrom).toEqual(["users"]);
  });

  it("uses prisma scope for custom roles", () => {
    const rules = getRoleAssignmentRules({
      slug: "custom_role",
      membershipScope: RoleMembershipScope.TEAM,
    });

    expect(rules.membershipScope).toBe("team");
    expect(rules.assignableFrom).toEqual(["users", "team"]);
  });
});

describe("assertRoleAssignableFrom", () => {
  it("allows assignment from permitted context", () => {
    expect(() =>
      assertRoleAssignableFrom(
        { membershipScope: "team", requiresTeamMembership: true, assignableFrom: ["team"] },
        "team",
      ),
    ).not.toThrow();
  });

  it("rejects assignment from disallowed context", () => {
    expect(() =>
      assertRoleAssignableFrom(
        { membershipScope: "team", requiresTeamMembership: true, assignableFrom: ["team"] },
        "users",
      ),
    ).toThrow("Role cannot be assigned from users context");
  });
});

describe("listDefaultAssignableSlugs", () => {
  it("lists team-assignable default roles", () => {
    const slugs = listDefaultAssignableSlugs("team");

    expect(slugs).toContain("executive");
    expect(slugs).toContain("team_lead");
    expect(slugs).not.toContain("org_admin");
  });

  it("lists user-assignable default roles", () => {
    const slugs = listDefaultAssignableSlugs("users");

    expect(slugs).toContain("org_admin");
    expect(slugs).not.toContain("executive");
  });
});
