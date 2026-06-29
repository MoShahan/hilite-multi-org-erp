import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toOrganizationListApiParams } from "./organizationListParams";
import { toPlatformUserListApiParams } from "./platformUserListParams";
import { toPlatformAuditListApiParams } from "@/features/audit/auditListParams";

import type { ListAuditLogsResult } from "@/features/audit/auditTypes";
import type {
  CreateOrganizationInput,
  CreatePlatformUserInput,
  ListOrganizationOptionsQuery,
  ListOrganizationsResult,
  ListPlatformUsersResult,
  Organization,
  OrganizationListQuery,
  OrganizationModulesMap,
  OrganizationModulesResponse,
  OrganizationOptionsResult,
  PlatformAuditListQuery,
  PlatformUser,
  PlatformUserListQuery,
  UpdatePlatformUserStatusInput,
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

  listOrganizationOptions: async (
    query: ListOrganizationOptionsQuery = {},
  ): Promise<OrganizationOptionsResult> => {
    const response = await apiClient.get(
      "/api/v1/platform/organizations/options",
      {
        params:
          query.status && query.status !== "ALL"
            ? { status: query.status }
            : undefined,
      },
    );
    return unwrapResponse<OrganizationOptionsResult>(response);
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

  getOrganizationModules: async (
    id: string,
  ): Promise<OrganizationModulesResponse> => {
    const response = await apiClient.get(
      `/api/v1/platform/organizations/${id}/modules`,
    );
    return unwrapResponse<OrganizationModulesResponse>(response);
  },

  updateOrganizationModules: async (
    id: string,
    modules: Partial<OrganizationModulesMap>,
  ): Promise<OrganizationModulesResponse> => {
    const response = await apiClient.patch(
      `/api/v1/platform/organizations/${id}/modules`,
      { modules },
    );
    return unwrapResponse<OrganizationModulesResponse>(response);
  },

  listAuditLogs: async (
    query: PlatformAuditListQuery,
  ): Promise<ListAuditLogsResult> => {
    const response = await apiClient.get("/api/v1/platform/audit", {
      params: toPlatformAuditListApiParams(query),
    });
    return unwrapResponse<ListAuditLogsResult>(response);
  },

  listPlatformUsers: async (
    query: PlatformUserListQuery,
  ): Promise<ListPlatformUsersResult> => {
    const response = await apiClient.get("/api/v1/platform/users", {
      params: toPlatformUserListApiParams(query),
    });
    return unwrapResponse<ListPlatformUsersResult>(response);
  },

  createPlatformUser: async (
    input: CreatePlatformUserInput,
  ): Promise<PlatformUser> => {
    const response = await apiClient.post("/api/v1/platform/users", input);
    const data = unwrapResponse<{ user: PlatformUser }>(response);
    return data.user;
  },

  updatePlatformUserStatus: async (
    userId: string,
    input: UpdatePlatformUserStatusInput,
  ): Promise<PlatformUser> => {
    const response = await apiClient.patch(
      `/api/v1/platform/users/${userId}/status`,
      input,
    );
    const data = unwrapResponse<{ user: PlatformUser }>(response);
    return data.user;
  },
};
