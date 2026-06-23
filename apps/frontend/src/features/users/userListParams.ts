import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type { MembershipScope } from "@/features/roles/rolesTypes";

import type {
  UserListQuery,
  UserListSortBy,
  UserListSortOrder,
  UserListStatusFilter,
} from "./usersTypes";

export const DEFAULT_LIST_QUERY: UserListQuery = {
  search: "",
  status: "ALL",
  roleId: "",
  membershipScope: "ALL",
  teamId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: UserListSortBy[] = [
  "name",
  "email",
  "status",
  "role",
  "team",
  "createdAt",
];

const SORT_ORDER_VALUES: UserListSortOrder[] = ["asc", "desc"];
const STATUS_VALUES: UserListStatusFilter[] = ["ALL", "ACTIVE", "INACTIVE"];
const MEMBERSHIP_SCOPE_VALUES: (MembershipScope | "ALL")[] = [
  "ALL",
  "organization",
  "team",
];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

export const parseUserListParams = (
  searchParams: URLSearchParams,
): UserListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const statusRaw = searchParams.get("status")?.toUpperCase();
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();
  const membershipScopeRaw = searchParams.get("membershipScope")?.toLowerCase();

  const status = STATUS_VALUES.includes(statusRaw as UserListStatusFilter)
    ? (statusRaw as UserListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as UserListSortBy)
    ? (sortByRaw as UserListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as UserListSortOrder,
  )
    ? (sortOrderRaw as UserListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

  const membershipScope = MEMBERSHIP_SCOPE_VALUES.includes(
    membershipScopeRaw as MembershipScope | "ALL",
  )
    ? (membershipScopeRaw as MembershipScope | "ALL")
    : DEFAULT_LIST_QUERY.membershipScope;

  const page = parsePositiveInt(
    searchParams.get("page"),
    DEFAULT_LIST_QUERY.page,
  );

  const pageSizeRaw = parsePositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_LIST_QUERY.pageSize,
  );
  const pageSize = isAllowedPageSize(pageSizeRaw)
    ? pageSizeRaw
    : DEFAULT_PAGE_SIZE;

  return {
    search,
    status,
    roleId: searchParams.get("roleId") ?? "",
    membershipScope,
    teamId: searchParams.get("teamId") ?? "",
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

export const serializeUserListParams = (
  query: UserListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.status !== DEFAULT_LIST_QUERY.status) {
    params.set("status", query.status);
  }
  if (query.roleId) params.set("roleId", query.roleId);
  if (query.membershipScope !== DEFAULT_LIST_QUERY.membershipScope) {
    params.set("membershipScope", query.membershipScope);
  }
  if (query.teamId) params.set("teamId", query.teamId);
  if (query.sortBy !== DEFAULT_LIST_QUERY.sortBy) {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortOrder !== DEFAULT_LIST_QUERY.sortOrder) {
    params.set("sortOrder", query.sortOrder);
  }
  if (query.page !== DEFAULT_LIST_QUERY.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
};

export const hasActiveListFilters = (query: UserListQuery): boolean => {
  return (
    query.search.trim().length > 0 ||
    query.status !== "ALL" ||
    !!query.roleId ||
    query.membershipScope !== "ALL" ||
    !!query.teamId
  );
};

export const clearListFilters = (query: UserListQuery): UserListQuery => ({
  ...query,
  search: "",
  status: "ALL",
  roleId: "",
  membershipScope: "ALL",
  teamId: "",
  page: 1,
});

export const toUserListApiParams = (query: UserListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status,
  };

  if (query.search.trim()) params.search = query.search.trim();
  if (query.roleId) params.roleId = query.roleId;
  if (query.membershipScope !== "ALL") {
    params.membershipScope = query.membershipScope;
  }
  if (query.teamId) params.teamId = query.teamId;

  return params;
};
