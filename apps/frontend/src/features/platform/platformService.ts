import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toOrganizationListApiParams } from "./organizationListParams";

import type {
  CreateOrganizationInput,
  ListOrganizationsResult,
  Organization,
  OrganizationListQuery,
  UpdateOrganizationInput,
} from "./platformTypes";

export const platformService = {
  listOrganizations: async (
    query: OrganizationListQuery,
  ): Promise<ListOrganizationsResult> => {
    const response = await apiClient.get("/api/v1/platform/organizations", {
      params: toOrganizationListApiParams(query),
    });
    return unwrapResponse<ListOrganizationsResult>(response);
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(
      `/api/v1/platform/organizations/${id}`,
    );
    const data = unwrapResponse<{ organization: Organization }>(response);
    return data.organization;
  },

  createOrganization: async (
    input: CreateOrganizationInput,
  ): Promise<Organization> => {
    const response = await apiClient.post(
      "/api/v1/platform/organizations",
      input,
    );
    const data = unwrapResponse<{ organization: Organization }>(response);
    return data.organization;
  },

  updateOrganization: async (
    id: string,
    input: UpdateOrganizationInput,
  ): Promise<Organization> => {
    const response = await apiClient.patch(
      `/api/v1/platform/organizations/${id}`,
      input,
    );
    const data = unwrapResponse<{ organization: Organization }>(response);
    return data.organization;
  },

  updateOrganizationStatus: async (
    id: string,
    status: Organization["status"],
  ): Promise<Organization> => {
    const response = await apiClient.patch(
      `/api/v1/platform/organizations/${id}/status`,
      { status },
    );
    const data = unwrapResponse<{ organization: Organization }>(response);
    return data.organization;
  },
};
