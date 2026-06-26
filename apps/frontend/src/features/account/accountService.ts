import { apiClient, unwrapResponse } from "@/lib/api-client";
import type { AuthMeResponse } from "@/features/auth/authTypes";

import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "./accountTypes";

export const accountService = {
  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<AuthMeResponse> => {
    const response = await apiClient.patch("/api/v1/auth/me", payload);
    return unwrapResponse<AuthMeResponse>(response);
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(
      "/api/v1/auth/change-password",
      payload,
    );
    return unwrapResponse<{ message: string }>(response);
  },
};
