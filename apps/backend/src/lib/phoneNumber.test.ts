import { describe, expect, it } from "vitest";

import { AppError } from "../utils/AppError";

import {
  parseOptionalPhoneNumber,
  parseRequiredPhoneNumber,
} from "./phoneNumber";

describe("parseRequiredPhoneNumber", () => {
  it("accepts a 10-digit number", () => {
    expect(parseRequiredPhoneNumber("9876543210")).toBe("9876543210");
  });

  it("trims whitespace", () => {
    expect(parseRequiredPhoneNumber("  9876543210  ")).toBe("9876543210");
  });

  it("rejects empty values", () => {
    expect(() => parseRequiredPhoneNumber("")).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber("   ")).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber(null)).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber(undefined)).toThrow(AppError);
  });

  it("rejects invalid formats", () => {
    expect(() => parseRequiredPhoneNumber("987654321")).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber("98765432101")).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber("abcdefghij")).toThrow(AppError);
    expect(() => parseRequiredPhoneNumber("+919876543210")).toThrow(AppError);
  });
});

describe("parseOptionalPhoneNumber", () => {
  it("returns null for empty values", () => {
    expect(parseOptionalPhoneNumber("")).toBeNull();
    expect(parseOptionalPhoneNumber(null)).toBeNull();
    expect(parseOptionalPhoneNumber(undefined)).toBeNull();
  });
});
