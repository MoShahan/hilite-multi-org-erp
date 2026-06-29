import { apiClient, unwrapResponse } from "@/lib/api-client";

import type {
  CreateRoleInput,
  ListRolesOptions,
  PermissionCatalogItem,
  Role,
  RoleOptionsResult,
  UpdateRoleInput,
} from "./rolesTypes";

export const rolesService = {
  listPermissions: async (): Promise<PermissionCatalogItem[]> => {
    const response = await apiClient.get("/api/v1/permissions");
    const data = unwrapResponse<{ permissions: PermissionCatalogItem[] }>(
      response,
    );
    return data.permissions;
  },

  listRoles: async (options: ListRolesOptions = {}): Promise<Role[]> => {
    const params: Record<string, string> = {};
    if (options.membershipScope) {
      params.membershipScope = options.membershipScope;
    }
    if (options.assignableFrom) {
      params.assignableFrom = options.assignableFrom;
    }
    const response = await apiClient.get("/api/v1/roles", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    const data = unwrapResponse<{ roles: Role[] }>(response);
    return data.roles;
  },

  listRoleOptions: async (
    options: ListRolesOptions = {},
  ): Promise<RoleOptionsResult> => {
    const params: Record<string, string> = {};
    if (options.membershipScope) {
      params.membershipScope = options.membershipScope;
    }
    if (options.assignableFrom) {
      params.assignableFrom = options.assignableFrom;
    }
    const response = await apiClient.get("/api/v1/roles/options", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return unwrapResponse<RoleOptionsResult>(response);
  },

  getRole: async (id: string): Promise<Role> => {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    const data = unwrapResponse<{ role: Role }>(response);
    return data.role;
  },

  createRole: async (input: CreateRoleInput): Promise<Role> => {
    const response = await apiClient.post("/api/v1/roles", input);
    const data = unwrapResponse<{ role: Role }>(response);
    return data.role;
  },

  updateRole: async (id: string, input: UpdateRoleInput): Promise<Role> => {
    const response = await apiClient.patch(`/api/v1/roles/${id}`, input);
    const data = unwrapResponse<{ role: Role }>(response);
    return data.role;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/roles/${id}`);
  },
};
