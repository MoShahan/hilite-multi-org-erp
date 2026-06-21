import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  OrganizationListQuery,
  OrganizationListSortBy,
  OrganizationListSortOrder,
  OrganizationListStatusFilter,
} from "./platformTypes";

export const DEFAULT_LIST_QUERY: OrganizationListQuery = {
  search: "",
  status: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: OrganizationListSortBy[] = [
  "name",
  "code",
  "status",
  "userCount",
  "createdAt",
];

const SORT_ORDER_VALUES: OrganizationListSortOrder[] = ["asc", "desc"];

const STATUS_VALUES: OrganizationListStatusFilter[] = [
  "ALL",
  "ACTIVE",
  "SUSPENDED",
];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const parseOrganizationListParams = (
  searchParams: URLSearchParams,
): OrganizationListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const statusRaw = searchParams.get("status")?.toUpperCase();
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const status = STATUS_VALUES.includes(
    statusRaw as OrganizationListStatusFilter,
  )
    ? (statusRaw as OrganizationListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as OrganizationListSortBy)
    ? (sortByRaw as OrganizationListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as OrganizationListSortOrder,
  )
    ? (sortOrderRaw as OrganizationListSortOrder)
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

  return { search, status, sortBy, sortOrder, page, pageSize };
};

export const serializeOrganizationListParams = (
  query: OrganizationListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.status !== DEFAULT_LIST_QUERY.status) {
    params.set("status", query.status);
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

export const isDefaultListQuery = (query: OrganizationListQuery): boolean => {
  return (
    serializeOrganizationListParams(query).toString() ===
    serializeOrganizationListParams(DEFAULT_LIST_QUERY).toString()
  );
};

export const hasActiveListFilters = (query: OrganizationListQuery): boolean => {
  return query.search.trim().length > 0 || query.status !== "ALL";
};

export const clearListFilters = (
  query: OrganizationListQuery,
): OrganizationListQuery => ({
  ...query,
  search: "",
  status: "ALL",
  page: 1,
});

export const toOrganizationListApiParams = (query: OrganizationListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status,
  };

  if (query.search.trim()) {
    params.search = query.search.trim();
  }

  return params;
};

export const getOrganizationListQueryKey = (query: OrganizationListQuery) => {
  return serializeOrganizationListParams(query).toString();
};
