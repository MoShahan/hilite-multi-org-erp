import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  PlatformUserListQuery,
  PlatformUserListSortBy,
  PlatformUserListSortOrder,
  PlatformUserListStatusFilter,
} from "./platformTypes";

export const DEFAULT_PLATFORM_USERS_LIST_QUERY: PlatformUserListQuery = {
  search: "",
  status: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: PlatformUserListSortBy[] = [
  "name",
  "email",
  "status",
  "createdAt",
];

const SORT_ORDER_VALUES: PlatformUserListSortOrder[] = ["asc", "desc"];

const STATUS_VALUES: PlatformUserListStatusFilter[] = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const parsePlatformUserListParams = (
  searchParams: URLSearchParams,
): PlatformUserListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const statusRaw = searchParams.get("status")?.toUpperCase();
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const status = STATUS_VALUES.includes(
    statusRaw as PlatformUserListStatusFilter,
  )
    ? (statusRaw as PlatformUserListStatusFilter)
    : DEFAULT_PLATFORM_USERS_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as PlatformUserListSortBy)
    ? (sortByRaw as PlatformUserListSortBy)
    : DEFAULT_PLATFORM_USERS_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as PlatformUserListSortOrder,
  )
    ? (sortOrderRaw as PlatformUserListSortOrder)
    : DEFAULT_PLATFORM_USERS_LIST_QUERY.sortOrder;

  const page = parsePositiveInt(
    searchParams.get("page"),
    DEFAULT_PLATFORM_USERS_LIST_QUERY.page,
  );

  const pageSizeRaw = parsePositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_PLATFORM_USERS_LIST_QUERY.pageSize,
  );

  const pageSize = isAllowedPageSize(pageSizeRaw)
    ? pageSizeRaw
    : DEFAULT_PLATFORM_USERS_LIST_QUERY.pageSize;

  return {
    search,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

export const serializePlatformUserListParams = (
  query: PlatformUserListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.status !== "ALL") {
    params.set("status", query.status);
  }

  if (query.sortBy !== DEFAULT_PLATFORM_USERS_LIST_QUERY.sortBy) {
    params.set("sortBy", query.sortBy);
  }

  if (query.sortOrder !== DEFAULT_PLATFORM_USERS_LIST_QUERY.sortOrder) {
    params.set("sortOrder", query.sortOrder);
  }

  if (query.page !== 1) {
    params.set("page", String(query.page));
  }

  if (query.pageSize !== DEFAULT_PLATFORM_USERS_LIST_QUERY.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
};

export const toPlatformUserListApiParams = (query: PlatformUserListQuery) => ({
  search: query.search || undefined,
  status: query.status === "ALL" ? undefined : query.status,
  sortBy: query.sortBy,
  sortOrder: query.sortOrder,
  page: query.page,
  pageSize: query.pageSize,
});

export const hasActivePlatformUserListFilters = (
  query: PlatformUserListQuery,
): boolean =>
  query.search.length > 0 || query.status !== "ALL";

export const clearPlatformUserListFilters = (
  query: PlatformUserListQuery,
): PlatformUserListQuery => ({
  ...query,
  search: "",
  status: "ALL",
  page: 1,
});
