import {
  DEFAULT_PAGE_SIZE,
  isAllowedPageSize,
} from "@/lib/pagination";

import type {
  AuditAction,
  AuditEntityType,
  AuditListQuery,
  PlatformAuditListQuery,
} from "./auditTypes";

export const DEFAULT_AUDIT_LIST_QUERY: AuditListQuery = {
  search: "",
  action: "ALL",
  entityType: "ALL",
  from: "",
  to: "",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const AUDIT_ACTIONS = new Set<string>([
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "AUTH_LOGOUT",
  "AUTH_TOKEN_REFRESHED",
  "AUTH_TOKEN_REFRESH_FAILED",
  "AUTH_SESSION_REVOKED",
  "AUTH_PROFILE_UPDATED",
  "AUTH_PASSWORD_CHANGED",
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_STATUS_CHANGED",
  "LEAD_ASSIGNED",
  "LEAD_REASSIGNED",
  "LEAD_UNASSIGNED",
  "ACTIVITY_LOGGED",
  "USER_CREATED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "TEAM_CREATED",
  "TEAM_MEMBER_ADDED",
  "ROLE_CREATED",
  "ROLE_UPDATED",
  "ROLE_DELETED",
  "ORG_CREATED",
  "ORG_UPDATED",
  "ORG_STATUS_CHANGED",
  "ORG_MODULES_UPDATED",
]);

const ENTITY_TYPES = new Set<string>([
  "auth",
  "lead",
  "activity",
  "user",
  "team",
  "role",
  "organization",
]);

const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

const parseAuditListQuery = (
  searchParams: URLSearchParams,
): AuditListQuery => {
  const actionRaw = searchParams.get("action");
  const entityTypeRaw = searchParams.get("entityType");
  const pageSizeRaw = parsePositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_AUDIT_LIST_QUERY.pageSize,
  );

  return {
    search: searchParams.get("search")?.trim() ?? "",
    action:
      actionRaw && AUDIT_ACTIONS.has(actionRaw)
        ? (actionRaw as AuditAction)
        : "ALL",
    entityType:
      entityTypeRaw && ENTITY_TYPES.has(entityTypeRaw)
        ? (entityTypeRaw as AuditEntityType)
        : "ALL",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    page: parsePositiveInt(
      searchParams.get("page"),
      DEFAULT_AUDIT_LIST_QUERY.page,
    ),
    pageSize: isAllowedPageSize(pageSizeRaw)
      ? pageSizeRaw
      : DEFAULT_PAGE_SIZE,
  };
};

export const parseAuditListParams = parseAuditListQuery;

export const parsePlatformAuditListParams = (
  searchParams: URLSearchParams,
): PlatformAuditListQuery => ({
  ...parseAuditListQuery(searchParams),
  organizationId: searchParams.get("organizationId") ?? "",
});

const serializeAuditListQuery = (query: AuditListQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.action !== "ALL") params.set("action", query.action);
  if (query.entityType !== "ALL") params.set("entityType", query.entityType);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.page !== DEFAULT_AUDIT_LIST_QUERY.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
};

export const serializeAuditListParams = serializeAuditListQuery;

export const serializePlatformAuditListParams = (
  query: PlatformAuditListQuery,
): URLSearchParams => {
  const params = serializeAuditListQuery(query);
  if (query.organizationId) {
    params.set("organizationId", query.organizationId);
  }
  return params;
};

export const hasActiveAuditListFilters = (query: AuditListQuery): boolean =>
  query.search.trim().length > 0 ||
  query.action !== "ALL" ||
  query.entityType !== "ALL" ||
  !!query.from ||
  !!query.to;

export const hasActivePlatformAuditListFilters = (
  query: PlatformAuditListQuery,
): boolean =>
  hasActiveAuditListFilters(query) || !!query.organizationId;

export const clearAuditListFilters = (
  query: AuditListQuery,
): AuditListQuery => ({
  ...query,
  search: "",
  action: "ALL",
  entityType: "ALL",
  from: "",
  to: "",
  page: 1,
});

export const clearPlatformAuditListFilters = (
  query: PlatformAuditListQuery,
): PlatformAuditListQuery => ({
  ...clearAuditListFilters(query),
  organizationId: "",
});

export const toAuditListApiParams = (query: AuditListQuery) => {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
  };

  if (query.search.trim()) params.search = query.search.trim();
  if (query.action !== "ALL") params.action = query.action;
  if (query.entityType !== "ALL") params.entityType = query.entityType;
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;

  return params;
};

export const toPlatformAuditListApiParams = (query: PlatformAuditListQuery) => {
  const params = toAuditListApiParams(query);
  if (query.organizationId) params.organizationId = query.organizationId;
  return params;
};
