import type { DashboardLayoutResponse } from "./dashboardLayoutTypes";
import type { DashboardSummaryResponse } from "./dashboardTypes";

export type DashboardState = {
  summary: DashboardSummaryResponse | null;
  layout: DashboardLayoutResponse | null;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  layoutMutationStatus: "idle" | "loading";
};
