import { describe, expect, it } from "vitest";

import {
  clearListFilters,
  DEFAULT_LIST_QUERY,
  hasActiveListFilters,
  isDefaultListQuery,
  parseOrganizationListParams,
  serializeOrganizationListParams,
  toOrganizationListApiParams,
} from "./organizationListParams";

describe("organizationListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseOrganizationListParams(new URLSearchParams())).toEqual(
      DEFAULT_LIST_QUERY,
    );
  });

  it("falls back to defaults for invalid enum values", () => {
    const parsed = parseOrganizationListParams(
      new URLSearchParams({
        status: "DELETED",
        sortBy: "invalid",
        sortOrder: "up",
      }),
    );

    expect(parsed.status).toBe(DEFAULT_LIST_QUERY.status);
    expect(parsed.sortBy).toBe(DEFAULT_LIST_QUERY.sortBy);
    expect(parsed.sortOrder).toBe(DEFAULT_LIST_QUERY.sortOrder);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseOrganizationListParams(
      new URLSearchParams({ page: "-2", pageSize: "30" }),
    );

    expect(parsed.page).toBe(DEFAULT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(
      serializeOrganizationListParams(DEFAULT_LIST_QUERY).toString(),
    ).toBe("");
    expect(isDefaultListQuery(DEFAULT_LIST_QUERY)).toBe(true);
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_LIST_QUERY,
      search: "hilite",
      status: "SUSPENDED" as const,
      sortBy: "name" as const,
      page: 2,
      pageSize: 50 as const,
    };

    const roundTripped = parseOrganizationListParams(
      serializeOrganizationListParams(query),
    );
    expect(roundTripped).toEqual(query);
    expect(isDefaultListQuery(query)).toBe(false);
  });

  it("detects and clears active filters", () => {
    const filtered = { ...DEFAULT_LIST_QUERY, search: "org", status: "ACTIVE" as const };
    expect(hasActiveListFilters(filtered)).toBe(true);
    expect(hasActiveListFilters(clearListFilters(filtered))).toBe(false);
  });

  it("maps query to API params", () => {
    expect(
      toOrganizationListApiParams({
        ...DEFAULT_LIST_QUERY,
        search: "hilite",
        status: "ACTIVE",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "ACTIVE",
      search: "hilite",
    });
  });
});
