import { apiClient, unwrapResponse } from "@/lib/api-client";

import type { AuthMeResponse, LoginCredentials } from "./authTypes";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    await apiClient.post("/api/v1/auth/login", credentials);
  },

  logout: async () => {
    await apiClient.post("/api/v1/auth/logout");
  },

  refresh: async () => {
    await apiClient.post("/api/v1/auth/refresh");
  },

  fetchMe: async (): Promise<AuthMeResponse> => {
    const response = await apiClient.get("/api/v1/auth/me");
    return unwrapResponse(response);
  },
};
