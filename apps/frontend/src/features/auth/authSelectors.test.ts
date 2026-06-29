import { describe, expect, it } from "vitest";

import {
  selectCanAccessNotifications,
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
  selectIsAuthenticated,
  selectIsOrgAdmin,
  selectIsPlatformAdmin,
} from "./authSelectors";

import { authenticatedState, asRootState, platformAdminState } from "@/test/fixtures/auth";

describe("authSelectors", () => {
  it("detects authentication status", () => {
    const state = asRootState(authenticatedState());
    expect(selectIsAuthenticated(state)).toBe(true);
  });

  it("checks a single permission", () => {
    const state = asRootState(authenticatedState());
    expect(selectHasPermission("users:read")(state)).toBe(true);
    expect(selectHasPermission("roles:read")(state)).toBe(false);
  });

  it("checks any of multiple permissions", () => {
    const state = asRootState(authenticatedState());
    expect(
      selectHasAnyPermission(["users:read", "roles:read"])(state),
    ).toBe(true);
    expect(
      selectHasAnyPermission(["roles:read", "leads:read"])(state),
    ).toBe(false);
  });

  it("detects platform admin", () => {
    expect(selectIsPlatformAdmin(asRootState(platformAdminState()))).toBe(true);
    expect(selectIsPlatformAdmin(asRootState(authenticatedState()))).toBe(false);
  });

  it("checks enabled modules", () => {
    const state = asRootState(authenticatedState());
    expect(selectHasModule("sales_erp")(state)).toBe(true);
    expect(selectHasModule("notifications")(state)).toBe(false);
  });

  it("detects org admin role", () => {
    const state = asRootState(authenticatedState());
    expect(selectIsOrgAdmin(state)).toBe(true);
  });

  it("allows notifications for authenticated platform users without org", () => {
    const state = asRootState(
      platformAdminState(),
    );
    expect(selectCanAccessNotifications(state)).toBe(true);
  });

  it("requires notifications module for org users", () => {
    const withModule = asRootState(
      authenticatedState({ modules: ["notifications"] }),
    );
    const withoutModule = asRootState(
      authenticatedState({ modules: ["sales_erp"] }),
    );

    expect(selectCanAccessNotifications(withModule)).toBe(true);
    expect(selectCanAccessNotifications(withoutModule)).toBe(false);
  });
});
