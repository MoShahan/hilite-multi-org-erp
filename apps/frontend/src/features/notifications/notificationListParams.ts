import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  NotificationListFilter,
  NotificationListQuery,
} from "./notificationsTypes";

export const DEFAULT_LIST_QUERY: NotificationListQuery = {
  filter: "all",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const FILTER_VALUES: NotificationListFilter[] = ["all", "unread"];

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export const parseNotificationListParams = (
  searchParams: URLSearchParams,
): NotificationListQuery => {
  const filterRaw = searchParams.get("filter")?.toLowerCase();
  const filter = FILTER_VALUES.includes(filterRaw as NotificationListFilter)
    ? (filterRaw as NotificationListFilter)
    : DEFAULT_LIST_QUERY.filter;

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

  return { filter, page, pageSize };
};

export const serializeNotificationListParams = (
  query: NotificationListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.filter !== DEFAULT_LIST_QUERY.filter) {
    params.set("filter", query.filter);
  }
  if (query.page !== DEFAULT_LIST_QUERY.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
};

export const hasActiveListFilters = (query: NotificationListQuery): boolean =>
  query.filter !== "all";

export const clearListFilters = (
  query: NotificationListQuery,
): NotificationListQuery => ({
  ...query,
  filter: "all",
  page: 1,
});

export const toNotificationListApiParams = (query: NotificationListQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  ...(query.filter === "unread" ? { unreadOnly: true } : {}),
});
