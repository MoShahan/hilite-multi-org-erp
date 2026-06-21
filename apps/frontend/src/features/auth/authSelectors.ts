import type { RootState } from "@/app/store";

export const selectAuthUser = (state: RootState) => state.auth.user;

export const selectAuthOrganization = (state: RootState) =>
  state.auth.organization;

export const selectAuthStatus = (state: RootState) => state.auth.status;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated";

export const selectIsAuthLoading = (state: RootState) =>
  state.auth.status === "idle" || state.auth.status === "loading";

export const selectIsPlatformAdmin = (state: RootState) =>
  state.auth.user?.role === "PLATFORM_ADMIN";
