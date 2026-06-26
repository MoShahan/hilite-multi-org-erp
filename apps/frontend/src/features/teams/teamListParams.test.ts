import { describe, expect, it } from "vitest";

import {
  clearListFilters,
  DEFAULT_LIST_QUERY,
  hasActiveListFilters,
  parseTeamListParams,
  serializeTeamListParams,
  toTeamListApiParams,
} from "./teamListParams";

describe("teamListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseTeamListParams(new URLSearchParams())).toEqual(DEFAULT_LIST_QUERY);
  });

  it("falls back to defaults for invalid enum values", () => {
    const parsed = parseTeamListParams(
      new URLSearchParams({
        membership: "INVALID",
        sortBy: "invalid",
        sortOrder: "up",
      }),
    );

    expect(parsed.membership).toBe(DEFAULT_LIST_QUERY.membership);
    expect(parsed.sortBy).toBe(DEFAULT_LIST_QUERY.sortBy);
    expect(parsed.sortOrder).toBe(DEFAULT_LIST_QUERY.sortOrder);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseTeamListParams(
      new URLSearchParams({ page: "abc", pageSize: "7" }),
    );

    expect(parsed.page).toBe(DEFAULT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(serializeTeamListParams(DEFAULT_LIST_QUERY).toString()).toBe("");
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_LIST_QUERY,
      search: "sales",
      membership: "WITH_MEMBERS" as const,
      sortBy: "name" as const,
      page: 2,
      pageSize: 20 as const,
    };

    const roundTripped = parseTeamListParams(serializeTeamListParams(query));
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = { ...DEFAULT_LIST_QUERY, membership: "EMPTY" as const };
    expect(hasActiveListFilters(filtered)).toBe(true);
    expect(hasActiveListFilters(clearListFilters(filtered))).toBe(false);
  });

  it("maps query to API params", () => {
    expect(
      toTeamListApiParams({
        ...DEFAULT_LIST_QUERY,
        search: "alpha",
        membership: "WITH_MEMBERS",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      membership: "WITH_MEMBERS",
      search: "alpha",
    });
  });
});
