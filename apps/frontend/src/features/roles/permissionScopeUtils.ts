import type {
  GrantScope,
  MembershipScope,
  PermissionCatalogItem,
} from "./rolesTypes";

export const isOrgWidePermission = (permission: PermissionCatalogItem) =>
  permission.grantScope === "org_wide";

export const isTeamGrantPermission = (permission: PermissionCatalogItem) =>
  permission.grantScope === "team";

export const filterPermissionsForCreateRole = (
  permissions: PermissionCatalogItem[],
  roleMembershipScope: MembershipScope,
) => {
  if (roleMembershipScope === "organization") {
    return permissions;
  }

  return permissions.filter(
    (permission) => !isOrgWidePermission(permission),
  );
};

export const isPermissionDisabledForRole = (
  permission: PermissionCatalogItem,
  roleMembershipScope: MembershipScope,
) => {
  return (
    roleMembershipScope === "team" && isOrgWidePermission(permission)
  );
};

export const getMembershipScopeLabel = (scope: MembershipScope) =>
  scope === "team" ? "Team" : "Organization";

export const getGrantScopeLabel = (scope: GrantScope) =>
  scope === "team" ? "Team" : "Org-wide";
