import { describe, expect, it, vi } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-jwt-secret",
    jwtExpiresIn: "15m",
  },
}));

import { signAccessToken, verifyAccessToken } from "./jwt";

describe("jwt", () => {
  it("signs and verifies access tokens", () => {
    const token = signAccessToken({ sub: "user-1", orgId: "org-1" });

    expect(verifyAccessToken(token)).toMatchObject({
      sub: "user-1",
      orgId: "org-1",
    });
  });

  it("supports null organization id", () => {
    const token = signAccessToken({ sub: "platform-admin", orgId: null });

    expect(verifyAccessToken(token).orgId).toBeNull();
  });
});
