import { apiClient, unwrapResponse } from "@/lib/api-client";

import type { DashboardLayoutResponse, DashboardLayoutItem } from "./dashboardLayoutTypes";
import type { DashboardSummaryResponse } from "./dashboardTypes";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/summary");
    return unwrapResponse<DashboardSummaryResponse>(response);
  },

  getLayout: async (): Promise<DashboardLayoutResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/layout");
    return unwrapResponse<DashboardLayoutResponse>(response);
  },

  updateLayout: async (
    widgets: DashboardLayoutItem[],
  ): Promise<DashboardLayoutResponse> => {
    const response = await apiClient.put("/api/v1/dashboard/layout", {
      widgets,
    });
    return unwrapResponse<DashboardLayoutResponse>(response);
  },

  resetLayout: async (): Promise<DashboardLayoutResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/layout/reset");
    return unwrapResponse<DashboardLayoutResponse>(response);
  },
};
