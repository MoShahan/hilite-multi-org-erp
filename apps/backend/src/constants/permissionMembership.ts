import {
  PERMISSION_CATALOG,
  type PermissionCatalogEntry,
} from "./permissionCatalog";

import type { Permission } from "./permissions";

export type GrantScope = "team" | "org_wide";
export type ApiGrantScope = GrantScope;

const catalogByKey = new Map<string, PermissionCatalogEntry>(
  PERMISSION_CATALOG.map((entry) => [entry.key, entry]),
);

export const getPermissionCatalogEntry = (
  key: string,
): PermissionCatalogEntry | undefined => catalogByKey.get(key);

export const isOrgWidePermission = (key: string): boolean => {
  return getPermissionCatalogEntry(key)?.grantScope === "org_wide";
};

export const isTeamGrantPermission = (key: string): boolean => {
  return getPermissionCatalogEntry(key)?.grantScope === "team";
};

export const filterPermissionsForRoleScope = (
  catalog: PermissionCatalogEntry[],
  roleMembershipScope: "team" | "organization",
  mode: "create" | "edit",
): PermissionCatalogEntry[] => {
  if (roleMembershipScope === "organization") {
    return catalog;
  }

  if (mode === "create") {
    return catalog.filter((entry) => entry.grantScope !== "org_wide");
  }

  return catalog;
};

export const assertPermissionsMatchRoleMembershipScope = (
  permissionKeys: string[],
  roleMembershipScope: "team" | "organization",
): void => {
  if (roleMembershipScope !== "team") {
    return;
  }

  const invalidKeys = permissionKeys.filter(isOrgWidePermission);

  if (invalidKeys.length > 0) {
    throw new Error(
      `Org-wide permissions are not allowed on team roles: ${invalidKeys.join(", ")}`,
    );
  }
};

export const getCatalogGrantScope = (
  key: Permission,
): GrantScope | undefined => getPermissionCatalogEntry(key)?.grantScope;
