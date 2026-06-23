import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  LeadListQuery,
  LeadListSortBy,
  LeadListSortOrder,
  LeadListStatusFilter,
} from "./leadsTypes";

export const DEFAULT_LIST_QUERY: LeadListQuery = {
  search: "",
  status: "ALL",
  teamId: "",
  assignedToId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const SORT_BY_VALUES: LeadListSortBy[] = [
  "name",
  "status",
  "team",
  "assignee",
  "createdAt",
];

const SORT_ORDER_VALUES: LeadListSortOrder[] = ["asc", "desc"];

const STATUS_VALUES: LeadListStatusFilter[] = [
  "ALL",
  "NEW",
  "CONTACTED",
  "NEGOTIATION",
  "WON",
  "LOST",
  "SITE_VISIT_COMPLETED",
  "VISIT_SCHEDULED",
];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

export const parseLeadListParams = (
  searchParams: URLSearchParams,
): LeadListQuery => {
  const search = searchParams.get("search")?.trim() ?? "";
  const statusRaw = searchParams.get("status")?.toUpperCase();
  const sortByRaw = searchParams.get("sortBy");
  const sortOrderRaw = searchParams.get("sortOrder")?.toLowerCase();

  const status = STATUS_VALUES.includes(statusRaw as LeadListStatusFilter)
    ? (statusRaw as LeadListStatusFilter)
    : DEFAULT_LIST_QUERY.status;

  const sortBy = SORT_BY_VALUES.includes(sortByRaw as LeadListSortBy)
    ? (sortByRaw as LeadListSortBy)
    : DEFAULT_LIST_QUERY.sortBy;

  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderRaw as LeadListSortOrder,
  )
    ? (sortOrderRaw as LeadListSortOrder)
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

  return {
    search,
    status,
    teamId: searchParams.get("teamId") ?? "",
    assignedToId: searchParams.get("assignedToId") ?? "",
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
};

export const serializeLeadListParams = (
  query: LeadListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.status !== DEFAULT_LIST_QUERY.status) {
    params.set("status", query.status);
  }
  if (query.teamId) params.set("teamId", query.teamId);
  if (query.assignedToId) params.set("assignedToId", query.assignedToId);
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

export const hasActiveListFilters = (query: LeadListQuery): boolean =>
  query.search.trim().length > 0 ||
  query.status !== "ALL" ||
  !!query.teamId ||
  !!query.assignedToId;

export const clearListFilters = (query: LeadListQuery): LeadListQuery => ({
  ...query,
  search: "",
  status: "ALL",
  teamId: "",
  assignedToId: "",
  page: 1,
});

export const toLeadListApiParams = (query: LeadListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status,
  };

  if (query.search.trim()) params.search = query.search.trim();
  if (query.teamId) params.teamId = query.teamId;
  if (query.assignedToId) params.assignedToId = query.assignedToId;

  return params;
};
