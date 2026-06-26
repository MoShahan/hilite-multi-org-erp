import { describe, expect, it } from "vitest";

import {
  clearAuditListFilters,
  clearPlatformAuditListFilters,
  DEFAULT_AUDIT_LIST_QUERY,
  hasActiveAuditListFilters,
  hasActivePlatformAuditListFilters,
  parseAuditListParams,
  parsePlatformAuditListParams,
  serializeAuditListParams,
  serializePlatformAuditListParams,
  toAuditListApiParams,
  toPlatformAuditListApiParams,
} from "./auditListParams";

describe("auditListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseAuditListParams(new URLSearchParams())).toEqual(
      DEFAULT_AUDIT_LIST_QUERY,
    );
  });

  it("falls back to ALL for invalid action and entityType values", () => {
    const parsed = parseAuditListParams(
      new URLSearchParams({ action: "INVALID", entityType: "unknown" }),
    );

    expect(parsed.action).toBe("ALL");
    expect(parsed.entityType).toBe("ALL");
  });

  it("accepts valid action and entityType values", () => {
    const parsed = parseAuditListParams(
      new URLSearchParams({
        action: "LEAD_CREATED",
        entityType: "lead",
      }),
    );

    expect(parsed.action).toBe("LEAD_CREATED");
    expect(parsed.entityType).toBe("lead");
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseAuditListParams(
      new URLSearchParams({ page: "0", pageSize: "99" }),
    );

    expect(parsed.page).toBe(DEFAULT_AUDIT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_AUDIT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(serializeAuditListParams(DEFAULT_AUDIT_LIST_QUERY).toString()).toBe(
      "",
    );
  });

  it("round-trips non-default audit query values", () => {
    const query = {
      ...DEFAULT_AUDIT_LIST_QUERY,
      search: "login",
      action: "AUTH_LOGIN_SUCCESS" as const,
      entityType: "auth" as const,
      from: "2026-01-01",
      page: 2,
      pageSize: 20 as const,
    };

    const roundTripped = parseAuditListParams(serializeAuditListParams(query));
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active audit filters", () => {
    const filtered = {
      ...DEFAULT_AUDIT_LIST_QUERY,
      action: "USER_CREATED" as const,
    };
    expect(hasActiveAuditListFilters(filtered)).toBe(true);
    expect(hasActiveAuditListFilters(clearAuditListFilters(filtered))).toBe(
      false,
    );
  });

  it("maps query to API params", () => {
    expect(
      toAuditListApiParams({
        ...DEFAULT_AUDIT_LIST_QUERY,
        search: "lead",
        action: "LEAD_UPDATED",
        from: "2026-01-01",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      search: "lead",
      action: "LEAD_UPDATED",
      from: "2026-01-01",
    });
  });
});

describe("platform audit list params", () => {
  it("parses organizationId", () => {
    const parsed = parsePlatformAuditListParams(
      new URLSearchParams({ organizationId: "org-1" }),
    );

    expect(parsed.organizationId).toBe("org-1");
  });

  it("round-trips platform audit query values", () => {
    const query = {
      ...DEFAULT_AUDIT_LIST_QUERY,
      organizationId: "org-1",
      entityType: "organization" as const,
    };

    const roundTripped = parsePlatformAuditListParams(
      serializePlatformAuditListParams(query),
    );
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears platform-specific filters", () => {
    const filtered = {
      ...DEFAULT_AUDIT_LIST_QUERY,
      organizationId: "org-1",
    };
    expect(hasActivePlatformAuditListFilters(filtered)).toBe(true);
    expect(
      hasActivePlatformAuditListFilters(clearPlatformAuditListFilters(filtered)),
    ).toBe(false);
  });

  it("maps platform query to API params", () => {
    expect(
      toPlatformAuditListApiParams({
        ...DEFAULT_AUDIT_LIST_QUERY,
        organizationId: "org-1",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      organizationId: "org-1",
    });
  });
});
