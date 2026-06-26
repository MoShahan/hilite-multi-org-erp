import { describe, expect, it } from "vitest";

import {
  clearListFilters,
  DEFAULT_LIST_QUERY,
  hasActiveListFilters,
  parseNotificationListParams,
  serializeNotificationListParams,
  toNotificationListApiParams,
} from "./notificationListParams";

describe("notificationListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseNotificationListParams(new URLSearchParams())).toEqual(
      DEFAULT_LIST_QUERY,
    );
  });

  it("falls back to default filter for invalid values", () => {
    const parsed = parseNotificationListParams(
      new URLSearchParams({ filter: "archived" }),
    );

    expect(parsed.filter).toBe(DEFAULT_LIST_QUERY.filter);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseNotificationListParams(
      new URLSearchParams({ page: "0", pageSize: "99" }),
    );

    expect(parsed.page).toBe(DEFAULT_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(serializeNotificationListParams(DEFAULT_LIST_QUERY).toString()).toBe(
      "",
    );
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_LIST_QUERY,
      filter: "unread" as const,
      page: 2,
      pageSize: 20 as const,
    };

    const roundTripped = parseNotificationListParams(
      serializeNotificationListParams(query),
    );
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = { ...DEFAULT_LIST_QUERY, filter: "unread" as const };
    expect(hasActiveListFilters(filtered)).toBe(true);
    expect(hasActiveListFilters(clearListFilters(filtered))).toBe(false);
  });

  it("maps unread filter to API params", () => {
    expect(toNotificationListApiParams(DEFAULT_LIST_QUERY)).toEqual({
      page: 1,
      pageSize: 10,
    });

    expect(
      toNotificationListApiParams({
        ...DEFAULT_LIST_QUERY,
        filter: "unread",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      unreadOnly: true,
    });
  });
});
