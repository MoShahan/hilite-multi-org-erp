import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { PERMISSIONS } from "@/constants/permissions";

import type { RootState } from "@/app/store";
import type { Permission } from "@/constants/permissions";


export const selectAuthUser = (state: RootState) => state.auth.user;

export const selectAuthOrganization = (state: RootState) =>
  state.auth.organization;

export const selectAuthStatus = (state: RootState) => state.auth.status;

export const selectAuthPermissions = (state: RootState) =>
  state.auth.user?.permissions ?? [];

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated";

export const selectIsAuthLoading = (state: RootState) =>
  state.auth.status === "idle" || state.auth.status === "loading";

export const selectIsPlatformAdmin = (state: RootState) =>
  state.auth.user?.permissions.includes(PERMISSIONS.PLATFORM_ORGS_READ) ??
  false;

export const selectHasPermission =
  (permission: Permission) => (state: RootState) =>
    state.auth.user?.permissions.includes(permission) ?? false;

export const selectHasAnyPermission =
  (permissions: Permission[]) => (state: RootState) =>
    permissions.some((permission) =>
      state.auth.user?.permissions.includes(permission),
    );

export const selectAuthModules = (state: RootState) => state.auth.modules;

export const selectHasModule =
  (moduleKey: string) => (state: RootState) =>
    state.auth.modules.includes(moduleKey);

export const selectCanAccessNotifications = (state: RootState) => {
  const organization = selectAuthOrganization(state);

  if (!organization) {
    return selectIsAuthenticated(state);
  }

  return selectHasModule(ORG_MODULE_KEYS.NOTIFICATIONS)(state);
};

export const selectIsOrgAdmin = (state: RootState) =>
  state.auth.user?.role?.slug === "org_admin";
