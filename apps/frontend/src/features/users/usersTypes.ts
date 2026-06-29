import type { MembershipScope } from "@/features/roles/rolesTypes";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type UserListStatusFilter = UserStatus | "ALL";

export type UserListSortBy =
  | "name"
  | "email"
  | "status"
  | "role"
  | "team"
  | "createdAt";

export type UserListSortOrder = "asc" | "desc";

export type UserListQuery = {
  search: string;
  status: UserListStatusFilter;
  roleId: string;
  membershipScope: MembershipScope | "ALL";
  teamId: string;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  page: number;
  pageSize: number;
};

export type UserListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UserRoleSummary = {
  id: string;
  name: string;
  slug: string;
};

export type UserTeamSummary = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRoleSummary | null;
  team: UserTeamSummary | null;
  createdAt: string;
};

export type ListUsersResult = {
  users: User[];
  meta: UserListMeta;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

export type UpdateUserStatusInput = {
  status: UserStatus;
};

export type UsersState = {
  users: User[];
  listMeta: UserListMeta | null;
  listQuery: UserListQuery | null;
  listStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
  mutationStatus: "idle" | "loading";
};

export type OrganizationRoleOption = {
  id: string;
  name: string;
  slug: string;
};

export type TeamFilterOption = {
  id: string;
  name: string;
};

export type UserOption = {
  id: string;
  name: string;
  email: string;
};

export type UserListFor = "lead-assignment" | "filter";

export type ListUserOptionsQuery = {
  for: UserListFor;
  teamId?: string;
  search?: string;
};

export type UserOptionsResult = {
  users: UserOption[];
};
