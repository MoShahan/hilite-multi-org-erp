import { describe, expect, it } from "vitest";

import {
  clearListFilters,
  DEFAULT_LIST_QUERY,
  hasActiveListFilters,
  parseUserListParams,
  serializeUserListParams,
  toUserListApiParams,
} from "./userListParams";

describe("userListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseUserListParams(new URLSearchParams())).toEqual(DEFAULT_LIST_QUERY);
  });

  it("falls back to defaults for invalid enum values", () => {
    const parsed = parseUserListParams(
      new URLSearchParams({
        status: "UNKNOWN",
        sortBy: "invalid",
        membershipScope: "global",
      }),
    );

    expect(parsed.status).toBe(DEFAULT_LIST_QUERY.status);
    expect(parsed.sortBy).toBe(DEFAULT_LIST_QUERY.sortBy);
    expect(parsed.membershipScope).toBe(DEFAULT_LIST_QUERY.membershipScope);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseUserListParams(
      new URLSearchParams({ page: "-1", pageSize: "15" }),
    );

    expect(parsed.page).toBe(DEFAULT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(serializeUserListParams(DEFAULT_LIST_QUERY).toString()).toBe("");
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_LIST_QUERY,
      search: "jane",
      status: "ACTIVE" as const,
      roleId: "role-1",
      membershipScope: "team" as const,
      page: 3,
      pageSize: 50 as const,
    };

    const roundTripped = parseUserListParams(serializeUserListParams(query));
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = {
      ...DEFAULT_LIST_QUERY,
      roleId: "role-1",
      membershipScope: "organization" as const,
    };
    expect(hasActiveListFilters(filtered)).toBe(true);
    expect(hasActiveListFilters(clearListFilters(filtered))).toBe(false);
  });

  it("maps query to API params", () => {
    expect(
      toUserListApiParams({
        ...DEFAULT_LIST_QUERY,
        search: "jane",
        membershipScope: "team",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "ALL",
      search: "jane",
      membershipScope: "team",
    });
  });
});
