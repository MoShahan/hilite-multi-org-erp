import { describe, expect, it } from "vitest";

import { AppError } from "../utils/AppError";

import { parseOptionalEmail } from "./email";

describe("parseOptionalEmail", () => {
  it("returns null for empty values", () => {
    expect(parseOptionalEmail("")).toBeNull();
    expect(parseOptionalEmail("   ")).toBeNull();
    expect(parseOptionalEmail(null)).toBeNull();
    expect(parseOptionalEmail(undefined)).toBeNull();
  });

  it("accepts valid emails", () => {
    expect(parseOptionalEmail("user@example.com")).toBe("user@example.com");
    expect(parseOptionalEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("rejects malformed emails", () => {
    expect(() => parseOptionalEmail("not-an-email")).toThrow(AppError);
    expect(() => parseOptionalEmail("missing@domain")).toThrow(AppError);
    expect(() => parseOptionalEmail("@example.com")).toThrow(AppError);
  });
});
