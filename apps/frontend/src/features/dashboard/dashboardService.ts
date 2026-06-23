import { apiClient, unwrapResponse } from "@/lib/api-client";

import type { DashboardSummaryResponse } from "./dashboardTypes";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/summary");
    return unwrapResponse<DashboardSummaryResponse>(response);
  },
};
