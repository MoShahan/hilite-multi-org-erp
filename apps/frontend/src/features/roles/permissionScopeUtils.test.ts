import { describe, expect, it } from "vitest";

import {
  filterPermissionsForCreateRole,
  getGrantScopeLabel,
  getMembershipScopeLabel,
  isOrgWidePermission,
  isPermissionDisabledForRole,
  isTeamGrantPermission,
} from "./permissionScopeUtils";

import type { PermissionCatalogItem } from "./rolesTypes";

const orgWidePermission: PermissionCatalogItem = {
  key: "users:read",
  label: "Read users",
  description: null,
  scope: "ORGANIZATION",
  grantScope: "org_wide",
};

const teamPermission: PermissionCatalogItem = {
  key: "leads:read:team",
  label: "View leads in team",
  description: null,
  scope: "ORGANIZATION",
  grantScope: "team",
};

describe("permission scope helpers", () => {
  it("identifies org-wide and team grant permissions", () => {
    expect(isOrgWidePermission(orgWidePermission)).toBe(true);
    expect(isTeamGrantPermission(teamPermission)).toBe(true);
    expect(isOrgWidePermission(teamPermission)).toBe(false);
  });

  it("returns human-readable scope labels", () => {
    expect(getMembershipScopeLabel("team")).toBe("Team");
    expect(getMembershipScopeLabel("organization")).toBe("Organization");
    expect(getGrantScopeLabel("org_wide")).toBe("Org-wide");
    expect(getGrantScopeLabel("team")).toBe("Team");
  });
});

describe("filterPermissionsForCreateRole", () => {
  const permissions = [orgWidePermission, teamPermission];

  it("returns all permissions for organization-scoped roles", () => {
    expect(filterPermissionsForCreateRole(permissions, "organization")).toEqual(
      permissions,
    );
  });

  it("filters out org-wide permissions for team-scoped roles", () => {
    expect(filterPermissionsForCreateRole(permissions, "team")).toEqual([
      teamPermission,
    ]);
  });
});

describe("isPermissionDisabledForRole", () => {
  it("disables org-wide permissions for team-scoped roles", () => {
    expect(isPermissionDisabledForRole(orgWidePermission, "team")).toBe(true);
    expect(isPermissionDisabledForRole(teamPermission, "team")).toBe(false);
    expect(isPermissionDisabledForRole(orgWidePermission, "organization")).toBe(
      false,
    );
  });
});
