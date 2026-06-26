import { describe, expect, it } from "vitest";

import { parseDurationToMs } from "./duration";

describe("parseDurationToMs", () => {
  it("parses day durations", () => {
    expect(parseDurationToMs("7d")).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("parses hour durations", () => {
    expect(parseDurationToMs("2h")).toBe(2 * 60 * 60 * 1000);
  });

  it("parses minute durations", () => {
    expect(parseDurationToMs("15m")).toBe(15 * 60 * 1000);
  });

  it("parses second durations", () => {
    expect(parseDurationToMs("30s")).toBe(30 * 1000);
  });

  it("defaults unknown formats to one day", () => {
    expect(parseDurationToMs("invalid")).toBe(24 * 60 * 60 * 1000);
  });
});
