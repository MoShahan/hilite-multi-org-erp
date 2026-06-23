import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  TeamListMembershipFilter,
  TeamListQuery,
  TeamListSortBy,
  TeamListSortOrder,
} from "./teamsTypes";

export const DEFAULT_LIST_QUERY: TeamListQuery = {
  search: "",
  membership: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: TeamListSortBy[] = ["name", "memberCount", "createdAt"];
const SORT_ORDER_VALUES: TeamListSortOrder[] = ["asc", "desc"];
const MEMBERSHIP_VALUES: TeamListMembershipFilter[] = [
  "ALL",
  "WITH_MEMBERS",
  "EMPTY",
];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export const parseTeamListParams = (
  searchParams: URLSearchParams,
): TeamListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const membershipRaw = searchParams.get("membership")?.toUpperCase();
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const membership = MEMBERSHIP_VALUES.includes(
    membershipRaw as TeamListMembershipFilter,
  )
    ? (membershipRaw as TeamListMembershipFilter)
    : DEFAULT_LIST_QUERY.membership;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as TeamListSortBy)
    ? (sortByRaw as TeamListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as TeamListSortOrder,
  )
    ? (sortOrderRaw as TeamListSortOrder)
    : DEFAULT_LIST_QUERY.sortOrder;

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

  return { search, membership, sortBy, sortOrder, page, pageSize };
};

export const serializeTeamListParams = (
  query: TeamListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.membership !== DEFAULT_LIST_QUERY.membership) {
    params.set("membership", query.membership);
  }
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

export const hasActiveListFilters = (query: TeamListQuery): boolean =>
  query.search.trim().length > 0 || query.membership !== "ALL";

export const clearListFilters = (query: TeamListQuery): TeamListQuery => ({
  ...query,
  search: "",
  membership: "ALL",
  page: 1,
});

export const toTeamListApiParams = (query: TeamListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    membership: query.membership,
  };
  if (query.search.trim()) {
    params.search = query.search.trim();
  }
  return params;
};
