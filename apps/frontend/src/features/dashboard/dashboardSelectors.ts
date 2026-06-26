import type { RootState } from "@/app/store";

export const selectDashboardSummary = (state: RootState) =>
  state.dashboard.summary;

export const selectDashboardLayout = (state: RootState) => state.dashboard.layout;

export const selectDashboardStatus = (state: RootState) => state.dashboard.status;

export const selectDashboardError = (state: RootState) => state.dashboard.error;

export const selectDashboardLayoutMutationStatus = (state: RootState) =>
  state.dashboard.layoutMutationStatus;

export const selectIsDashboardLoading = (state: RootState) =>
  state.dashboard.status === "loading" || state.dashboard.status === "idle";
