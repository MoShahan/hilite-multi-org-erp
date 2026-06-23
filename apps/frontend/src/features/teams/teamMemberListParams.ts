import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  TeamMemberListQuery,
  TeamMemberListSortBy,
  TeamMemberListSortOrder,
} from "./teamsTypes";

export const DEFAULT_MEMBER_LIST_QUERY: TeamMemberListQuery = {
  search: "",
  roleId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: TeamMemberListSortBy[] = [
  "name",
  "email",
  "role",
  "createdAt",
];

const SORT_ORDER_VALUES: TeamMemberListSortOrder[] = ["asc", "desc"];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export const parseTeamMemberListParams = (
  searchParams: URLSearchParams,
): TeamMemberListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const roleId = searchParams.get("roleId")?.trim() ?? "";
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as TeamMemberListSortBy)
    ? (sortByRaw as TeamMemberListSortBy)
    : DEFAULT_MEMBER_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as TeamMemberListSortOrder,
  )
    ? (sortOrderRaw as TeamMemberListSortOrder)
    : DEFAULT_MEMBER_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(
    searchParams.get("page"),
    DEFAULT_MEMBER_LIST_QUERY.page,
  );

  const pageSizeRaw = parsePositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_MEMBER_LIST_QUERY.pageSize,
  );
  const pageSize = isAllowedPageSize(pageSizeRaw)
    ? pageSizeRaw
    : DEFAULT_PAGE_SIZE;

  return { search, roleId, sortBy, sortOrder, page, pageSize };
};

export const serializeTeamMemberListParams = (
  query: TeamMemberListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.roleId) {
    params.set("roleId", query.roleId);
  }
  if (query.sortBy !== DEFAULT_MEMBER_LIST_QUERY.sortBy) {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortOrder !== DEFAULT_MEMBER_LIST_QUERY.sortOrder) {
    params.set("sortOrder", query.sortOrder);
  }
  if (query.page !== DEFAULT_MEMBER_LIST_QUERY.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
};

export const hasActiveMemberListFilters = (
  query: TeamMemberListQuery,
): boolean => query.search.trim().length > 0 || query.roleId.length > 0;

export const clearMemberListFilters = (
  query: TeamMemberListQuery,
): TeamMemberListQuery => ({
  ...query,
  search: "",
  roleId: "",
  page: 1,
});

export const toTeamMemberListApiParams = (query: TeamMemberListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };

  if (query.search.trim()) {
    params.search = query.search.trim();
  }
  if (query.roleId) {
    params.roleId = query.roleId;
  }

  return params;
};
