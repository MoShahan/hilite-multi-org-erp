import { describe, expect, it } from "vitest";

import {
  selectCanViewDashboard,
  selectDefaultLandingPath,
} from "./defaultLandingPath";
import {
  asRootState,
  authenticatedState,
  mockAuthState,
  mockUser,
  platformAdminState,
} from "@/test/fixtures/auth";

describe("selectCanViewDashboard", () => {
  it("returns true when dashboards module and permission are present", () => {
    const state = asRootState(
      authenticatedState({
        modules: ["dashboards"],
        user: mockUser({ permissions: ["dashboard:me"] }),
      }),
    );

    expect(selectCanViewDashboard(state)).toBe(true);
  });

  it("returns false when module is missing", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["dashboard:me"] }),
      }),
    );

    expect(selectCanViewDashboard(state)).toBe(false);
  });
});

describe("selectDefaultLandingPath", () => {
  it("returns dashboard when dashboards module and permission are available", () => {
    const state = asRootState(
      authenticatedState({
        modules: ["dashboards"],
        user: mockUser({ permissions: ["dashboard:me"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/dashboard");
  });

  it("returns platform organizations for platform admin", () => {
    const state = asRootState(platformAdminState());
    expect(selectDefaultLandingPath(state)).toBe("/platform/organizations");
  });

  it("returns platform audit when platform audit read permission is present", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["platform:audit:read"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/platform/audit");
  });

  it("returns users when users:read is available", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["users:read"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/users");
  });

  it("returns teams when teams:read is available", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["teams:read"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/teams");
  });

  it("returns my-team when users:read:team is available without teams:read", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["users:read:team"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/my-team");
  });

  it("prefers teams over my-team when both permissions are present", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["teams:read", "users:read:team"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/teams");
  });

  it("returns leads when sales ERP module and lead read permission are available", () => {
    const state = asRootState(
      authenticatedState({
        modules: ["sales_erp"],
        user: mockUser({ permissions: ["leads:read"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/leads");
  });

  it("does not return leads without sales ERP module", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["leads:read", "roles:write"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/roles");
  });

  it("returns roles when roles:write is available", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["roles:write"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/roles");
  });

  it("returns audit when audit:read is available", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: ["audit:read"] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/audit");
  });

  it("falls back to home when no landing permission matches", () => {
    const state = asRootState(
      authenticatedState({
        modules: [],
        user: mockUser({ permissions: [] }),
      }),
    );

    expect(selectDefaultLandingPath(state)).toBe("/home");
  });

  it("falls back to home for unauthenticated users", () => {
    const state = asRootState({
      auth: mockAuthState({ status: "idle", user: null }),
    });

    expect(selectDefaultLandingPath(state)).toBe("/home");
  });
});
