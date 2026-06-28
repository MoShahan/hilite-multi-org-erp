import type { UserStatus } from "../generated/prisma/client";

export type PlatformUserResponse = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
};

export type PlatformUserListStatusFilter = UserStatus | "ALL";

export type PlatformUserListSortBy = "name" | "email" | "status" | "createdAt";

export type PlatformUserListSortOrder = "asc" | "desc";

export type ListPlatformUsersQuery = {
  search?: string;
  status?: PlatformUserListStatusFilter;
  sortBy?: PlatformUserListSortBy;
  sortOrder?: PlatformUserListSortOrder;
  page?: number;
  pageSize?: number;
};

export type ParsedListPlatformUsersQuery = {
  search?: string;
  status: PlatformUserListStatusFilter;
  sortBy: PlatformUserListSortBy;
  sortOrder: PlatformUserListSortOrder;
  page: number;
  pageSize: number;
};

export type PlatformUserListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedPlatformUsersResponse = {
  users: PlatformUserResponse[];
  meta: PlatformUserListMeta;
};

export type CreatePlatformUserInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdatePlatformUserStatusInput = {
  status: UserStatus;
};
