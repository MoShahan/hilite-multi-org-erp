import { describe, expect, it } from "vitest";

import {
  clearPlatformUserListFilters,
  DEFAULT_PLATFORM_USERS_LIST_QUERY,
  hasActivePlatformUserListFilters,
  parsePlatformUserListParams,
  serializePlatformUserListParams,
  toPlatformUserListApiParams,
} from "./platformUserListParams";

describe("platformUserListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parsePlatformUserListParams(new URLSearchParams())).toEqual(
      DEFAULT_PLATFORM_USERS_LIST_QUERY,
    );
  });

  it("falls back to defaults for invalid enum values", () => {
    const parsed = parsePlatformUserListParams(
      new URLSearchParams({
        status: "UNKNOWN",
        sortBy: "invalid",
        sortOrder: "sideways",
      }),
    );

    expect(parsed.status).toBe(DEFAULT_PLATFORM_USERS_LIST_QUERY.status);
    expect(parsed.sortBy).toBe(DEFAULT_PLATFORM_USERS_LIST_QUERY.sortBy);
    expect(parsed.sortOrder).toBe(DEFAULT_PLATFORM_USERS_LIST_QUERY.sortOrder);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parsePlatformUserListParams(
      new URLSearchParams({ page: "-1", pageSize: "15" }),
    );

    expect(parsed.page).toBe(DEFAULT_PLATFORM_USERS_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_PLATFORM_USERS_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(
      serializePlatformUserListParams(DEFAULT_PLATFORM_USERS_LIST_QUERY).toString(),
    ).toBe("");
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_PLATFORM_USERS_LIST_QUERY,
      search: "jane",
      status: "ACTIVE" as const,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
      page: 3,
      pageSize: 50 as const,
    };

    const roundTripped = parsePlatformUserListParams(
      serializePlatformUserListParams(query),
    );
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = {
      ...DEFAULT_PLATFORM_USERS_LIST_QUERY,
      search: "jane",
    };
    expect(hasActivePlatformUserListFilters(filtered)).toBe(true);
    expect(hasActivePlatformUserListFilters(clearPlatformUserListFilters(filtered))).toBe(
      false,
    );
  });

  it("maps query to API params", () => {
    expect(
      toPlatformUserListApiParams({
        ...DEFAULT_PLATFORM_USERS_LIST_QUERY,
        search: "jane",
        status: "ACTIVE",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "jane",
      status: "ACTIVE",
    });
  });
});
