import { describe, expect, it, vi } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    refreshTokenExpiresIn: "7d",
  },
}));

import {
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from "./refreshToken";

describe("refreshToken utilities", () => {
  it("generates unique opaque tokens", () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(20);
  });

  it("hashes tokens deterministically", () => {
    const raw = "sample-refresh-token";
    expect(hashRefreshToken(raw)).toBe(hashRefreshToken(raw));
    expect(hashRefreshToken(raw)).not.toBe(raw);
  });

  it("returns a future expiry based on configured duration", () => {
    const before = Date.now();
    const expiresAt = getRefreshTokenExpiresAt().getTime();
    const expected = before + 7 * 24 * 60 * 60 * 1000;

    expect(expiresAt).toBeGreaterThanOrEqual(expected - 1_000);
    expect(expiresAt).toBeLessThanOrEqual(expected + 1_000);
  });
});
