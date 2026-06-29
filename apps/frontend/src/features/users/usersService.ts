import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toUserListApiParams } from "./userListParams";

import type {
  CreateUserInput,
  ListUserOptionsQuery,
  ListUsersResult,
  UpdateUserStatusInput,
  User,
  UserListQuery,
  UserOptionsResult,
} from "./usersTypes";

export const usersService = {
  listUsers: async (query: UserListQuery): Promise<ListUsersResult> => {
    const response = await apiClient.get("/api/v1/users", {
      params: toUserListApiParams(query),
    });
    return unwrapResponse<ListUsersResult>(response);
  },

  listUserOptions: async (
    query: ListUserOptionsQuery,
  ): Promise<UserOptionsResult> => {
    const response = await apiClient.get("/api/v1/users/options", {
      params: {
        for: query.for,
        ...(query.teamId ? { teamId: query.teamId } : {}),
        ...(query.search ? { search: query.search } : {}),
      },
    });
    return unwrapResponse<UserOptionsResult>(response);
  },

  createUser: async (input: CreateUserInput): Promise<User> => {
    const response = await apiClient.post("/api/v1/users", input);
    const data = unwrapResponse<{ user: User }>(response);
    return data.user;
  },

  updateUserStatus: async (
    userId: string,
    input: UpdateUserStatusInput,
  ): Promise<User> => {
    const response = await apiClient.patch(
      `/api/v1/users/${userId}/status`,
      input,
    );
    const data = unwrapResponse<{ user: User }>(response);
    return data.user;
  },
};
