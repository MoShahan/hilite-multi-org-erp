import { describe, expect, it } from "vitest";

import { isAllowedPageSize } from "./pagination";

describe("isAllowedPageSize", () => {
  it("accepts valid page sizes", () => {
    expect(isAllowedPageSize(10)).toBe(true);
    expect(isAllowedPageSize(20)).toBe(true);
    expect(isAllowedPageSize(50)).toBe(true);
  });

  it("rejects invalid page sizes", () => {
    expect(isAllowedPageSize(5)).toBe(false);
    expect(isAllowedPageSize(100)).toBe(false);
    expect(isAllowedPageSize(0)).toBe(false);
  });
});
