import { describe, expect, it } from "vitest";

import {
  clearMemberListFilters,
  DEFAULT_MEMBER_LIST_QUERY,
  hasActiveMemberListFilters,
  parseTeamMemberListParams,
  serializeTeamMemberListParams,
  toTeamMemberListApiParams,
} from "./teamMemberListParams";

describe("teamMemberListParams", () => {
  it("returns defaults for empty search params", () => {
    expect(parseTeamMemberListParams(new URLSearchParams())).toEqual(
      DEFAULT_MEMBER_LIST_QUERY,
    );
  });

  it("falls back to defaults for invalid sort values", () => {
    const parsed = parseTeamMemberListParams(
      new URLSearchParams({ sortBy: "invalid", sortOrder: "up" }),
    );

    expect(parsed.sortBy).toBe(DEFAULT_MEMBER_LIST_QUERY.sortBy);
    expect(parsed.sortOrder).toBe(DEFAULT_MEMBER_LIST_QUERY.sortOrder);
  });

  it("clamps invalid page and pageSize values", () => {
    const parsed = parseTeamMemberListParams(
      new URLSearchParams({ page: "0", pageSize: "25" }),
    );

    expect(parsed.page).toBe(DEFAULT_MEMBER_LIST_QUERY.page);
    expect(parsed.pageSize).toBe(DEFAULT_MEMBER_LIST_QUERY.pageSize);
  });

  it("omits default values when serializing", () => {
    expect(
      serializeTeamMemberListParams(DEFAULT_MEMBER_LIST_QUERY).toString(),
    ).toBe("");
  });

  it("round-trips non-default query values", () => {
    const query = {
      ...DEFAULT_MEMBER_LIST_QUERY,
      search: "member",
      roleId: "role-1",
      sortBy: "name" as const,
      page: 2,
      pageSize: 20 as const,
    };

    const roundTripped = parseTeamMemberListParams(
      serializeTeamMemberListParams(query),
    );
    expect(roundTripped).toEqual(query);
  });

  it("detects and clears active filters", () => {
    const filtered = { ...DEFAULT_MEMBER_LIST_QUERY, roleId: "role-1" };
    expect(hasActiveMemberListFilters(filtered)).toBe(true);
    expect(hasActiveMemberListFilters(clearMemberListFilters(filtered))).toBe(
      false,
    );
  });

  it("maps query to API params", () => {
    expect(
      toTeamMemberListApiParams({
        ...DEFAULT_MEMBER_LIST_QUERY,
        search: "ann",
        roleId: "role-1",
      }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "ann",
      roleId: "role-1",
    });
  });
});
