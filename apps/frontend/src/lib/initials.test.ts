import { describe, expect, it } from "vitest";

import { getAvatarGradient, getInitials } from "./initials";

describe("getInitials", () => {
  it("returns ? for empty input", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });

  it("returns first two characters for a single word", () => {
    expect(getInitials("Alice")).toBe("AL");
  });

  it("returns first and last initials for multiple words", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Mary Jane Watson")).toBe("MW");
  });
});

describe("getAvatarGradient", () => {
  it("returns a consistent gradient for the same seed", () => {
    expect(getAvatarGradient("user-1")).toBe(getAvatarGradient("user-1"));
  });

  it("returns a gradient class string", () => {
    expect(getAvatarGradient("seed")).toMatch(/^from-/);
  });
});
