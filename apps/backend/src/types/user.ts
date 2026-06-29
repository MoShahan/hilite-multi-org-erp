import type { RoleMembershipScopeValue } from "../constants/defaultRoles";
import type { UserStatus } from "../generated/prisma/client";

export type UserRoleSummary = {
  id: string;
  name: string;
  slug: string;
};

export type UserTeamSummary = {
  id: string;
  name: string;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRoleSummary | null;
  team: UserTeamSummary | null;
  createdAt: string;
};

export type UserListStatusFilter = UserStatus | "ALL";

export type UserListSortBy =
  | "name"
  | "email"
  | "status"
  | "role"
  | "team"
  | "createdAt";

export type UserListSortOrder = "asc" | "desc";

export type UserListFor = "lead-assignment" | "filter";

export type UserOption = {
  id: string;
  name: string;
  email: string;
};

export type ListUserOptionsQuery = {
  for?: UserListFor;
  teamId?: string;
  search?: string;
};

export type ParsedUserOptionsQuery = {
  for: UserListFor;
  teamId?: string;
  teamIdIsNone?: boolean;
  search?: string;
  status: UserListStatusFilter;
};

export type UserOptionsResponse = {
  users: UserOption[];
};

export type ListUsersQuery = {
  search?: string;
  status?: UserListStatusFilter;
  roleId?: string;
  membershipScope?: RoleMembershipScopeValue;
  teamId?: string;
  for?: UserListFor;
  sortBy?: UserListSortBy;
  sortOrder?: UserListSortOrder;
  page?: number;
  pageSize?: number;
};

export type UserListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ParsedListUsersQuery = {
  search?: string;
  status: UserListStatusFilter;
  roleId?: string;
  membershipScope?: RoleMembershipScopeValue;
  teamId?: string;
  teamIdIsNone?: boolean;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  page: number;
  pageSize: number;
};

export type PaginatedUsersResponse = {
  users: UserResponse[];
  meta: UserListMeta;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

export type UpdateUserStatusInput = {
  status: "ACTIVE" | "INACTIVE";
};
