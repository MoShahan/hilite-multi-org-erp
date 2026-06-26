import { describe, expect, it } from "vitest";

import {
  clearListFilters,
  DEFAULT_LIST_QUERY,
  hasActiveListFilters,
  parseLeadListParams,
  serializeLeadListParams,
  toLeadListApiParams,
} from "./leadListParams";

describe("leadListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseLeadListParams(new URLSearchParams())).toEqual(DEFAULT_LIST_QUERY);
  });

  it("falls back to defaults for invalid enum values", () => {
    const parsed = parseLeadListParams(
      new URLSearchParams({
        status: "INVALID",
        sortBy: "invalid",
        sortOrder: "sideways",
      }),
    );

    expect(parsed.status).toBe(DEFAULT_LIST_QUERY.status);
    expect(parsed.sortBy).toBe(DEFAULT_LIST_QUERY.sortBy);
    expect(parsed.sortOrder).toBe(DEFAULT_LIST_QUERY.sortOrder);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseLeadListParams(
      new URLSearchParams({ page: "0", pageSize: "99" }),
    );

    expect(parsed.page).toBe(DEFAULT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(serializeLeadListParams(DEFAULT_LIST_QUERY).toString()).toBe("");
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_LIST_QUERY,
      search: "acme",
      status: "WON" as const,
      teamId: "team-1",
      page: 2,
      pageSize: 20 as const,
    };

    const roundTripped = parseLeadListParams(serializeLeadListParams(query));
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = { ...DEFAULT_LIST_QUERY, search: "lead", status: "NEW" as const };
    expect(hasActiveListFilters(filtered)).toBe(true);
    expect(hasActiveListFilters(clearListFilters(filtered))).toBe(false);
  });

  it("maps query to API params", () => {
    expect(
      toLeadListApiParams({
        ...DEFAULT_LIST_QUERY,
        search: "  acme ",
        teamId: "team-1",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "ALL",
      search: "acme",
      teamId: "team-1",
    });
  });
});
