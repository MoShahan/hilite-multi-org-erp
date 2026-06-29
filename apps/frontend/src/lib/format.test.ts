import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatDateTime, formatRelativeTime, formatRoleLabel, formatWinRate, formatWinRateDetail } from "./format";

describe("formatRoleLabel", () => {
  it("returns No role when role is null or undefined", () => {
    expect(formatRoleLabel(null)).toBe("No role");
    expect(formatRoleLabel(undefined)).toBe("No role");
  });

  it("returns the role name when present", () => {
    expect(
      formatRoleLabel({ id: "1", name: "Org Admin", slug: "org_admin" }),
    ).toBe("Org Admin");
  });

  it("returns Team Leader for the team_lead slug", () => {
    expect(
      formatRoleLabel({ id: "1", name: "Team Lead", slug: "team_lead" }),
    ).toBe("Team Leader");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Just now for times under one minute ago", () => {
    expect(formatRelativeTime("2026-06-24T11:59:30.000Z")).toBe("Just now");
  });

  it("returns minutes ago for times under one hour", () => {
    expect(formatRelativeTime("2026-06-24T11:30:00.000Z")).toBe("30m ago");
  });

  it("returns hours ago for times under one day", () => {
    expect(formatRelativeTime("2026-06-24T09:00:00.000Z")).toBe("3h ago");
  });

  it("returns days ago for times under one week", () => {
    expect(formatRelativeTime("2026-06-22T12:00:00.000Z")).toBe("2d ago");
  });

  it("returns a locale date string for older times", () => {
    expect(formatRelativeTime("2026-06-01T12:00:00.000Z")).toBe(
      new Date("2026-06-01T12:00:00.000Z").toLocaleDateString(),
    );
  });
});

describe("formatDateTime", () => {
  it("formats ISO dates with medium date and short time", () => {
    const formatted = formatDateTime("2026-06-24T12:00:00.000Z");
    expect(formatted).toContain("2026");
  });
});

describe("formatDate", () => {
  it("formats ISO dates with medium date style", () => {
    const formatted = formatDate("2026-06-24T12:00:00.000Z");
    expect(formatted).toContain("2026");
  });
});

describe("formatWinRate", () => {
  it("returns em dash for null win rate", () => {
    expect(formatWinRate(null)).toBe("—");
  });

  it("returns percentage for numeric win rate", () => {
    expect(formatWinRate(42)).toBe("42%");
  });
});

describe("formatWinRateDetail", () => {
  it("returns placeholder when win rate is null", () => {
    expect(formatWinRateDetail(null, 0, 0)).toEqual({
      value: "—",
      description: "No closed leads yet",
    });
  });

  it("returns percentage and closed lead breakdown", () => {
    expect(formatWinRateDetail(60, 3, 2)).toEqual({
      value: "60%",
      description: "3 won / 5 closed",
    });
  });
});
