import type { RootState } from "@/app/store";

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
  state.auth.user?.permissions.includes("platform:orgs:read") ?? false;

export const selectHasPermission = (permission: string) => (state: RootState) =>
  state.auth.user?.permissions.includes(permission) ?? false;

export const selectHasAnyPermission =
  (permissions: string[]) => (state: RootState) =>
    permissions.some((permission) =>
      state.auth.user?.permissions.includes(permission),
    );

export const selectAuthModules = (state: RootState) => state.auth.modules;

export const selectHasModule =
  (moduleKey: string) => (state: RootState) =>
    state.auth.modules.includes(moduleKey);

export const selectIsOrgAdmin = (state: RootState) =>
  state.auth.user?.role?.slug === "org_admin";
