import { describe, expect, it } from "vitest";

import {
  DEFAULT_NEW_USER_PASSWORD,
  validatePasswordStrength,
} from "./password";

describe("validatePasswordStrength", () => {
  it("accepts a password that meets all rules", () => {
    expect(validatePasswordStrength(DEFAULT_NEW_USER_PASSWORD)).toEqual({
      valid: true,
    });
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePasswordStrength("Pa@1")).toEqual({
      valid: false,
      message: "Password must be at least 8 characters",
    });
  });

  it("rejects passwords without an uppercase letter", () => {
    expect(validatePasswordStrength("password@123")).toEqual({
      valid: false,
      message: "Password must include at least one uppercase letter",
    });
  });

  it("rejects passwords without a lowercase letter", () => {
    expect(validatePasswordStrength("PASSWORD@123")).toEqual({
      valid: false,
      message: "Password must include at least one lowercase letter",
    });
  });

  it("rejects passwords without a number", () => {
    expect(validatePasswordStrength("Password@abc")).toEqual({
      valid: false,
      message: "Password must include at least one number",
    });
  });

  it("rejects passwords without a special character", () => {
    expect(validatePasswordStrength("Password123")).toEqual({
      valid: false,
      message:
        "Password must include at least one special character (!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~)",
    });
  });
});
