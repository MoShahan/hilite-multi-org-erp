import { describe, expect, it, vi } from "vitest";

import { authReducer, fetchMe, login, logout } from "./authSlice";

import type { AuthMeResponse } from "./authTypes";

vi.mock("./authService", () => ({
  authService: {
    fetchMe: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockMeResponse: AuthMeResponse = {
  user: {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    phoneNumber: null,
    role: { id: "role-1", name: "Org Admin", slug: "org_admin" },
    permissions: ["users:read"],
    status: "ACTIVE",
    team: null,
  },
  organization: {
    id: "org-1",
    name: "Test Org",
    code: "TEST",
    status: "ACTIVE",
  },
  modules: ["sales_erp"],
};

describe("authSlice", () => {
  it("starts in idle state", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual({
      user: null,
      organization: null,
      modules: [],
      status: "idle",
    });
  });

  it("sets loading on fetchMe.pending", () => {
    const state = authReducer(undefined, fetchMe.pending("", undefined));
    expect(state.status).toBe("loading");
  });

  it("stores user data on fetchMe.fulfilled", () => {
    const state = authReducer(
      { user: null, organization: null, modules: [], status: "loading" },
      fetchMe.fulfilled(mockMeResponse, "", undefined),
    );

    expect(state.status).toBe("authenticated");
    expect(state.user).toEqual(mockMeResponse.user);
    expect(state.organization).toEqual(mockMeResponse.organization);
    expect(state.modules).toEqual(["sales_erp"]);
  });

  it("clears auth state on fetchMe.rejected", () => {
    const state = authReducer(
      {
        user: mockMeResponse.user,
        organization: mockMeResponse.organization,
        modules: ["sales_erp"],
        status: "loading",
      },
      fetchMe.rejected(new Error("Unauthorized"), "", undefined),
    );

    expect(state).toEqual({
      user: null,
      organization: null,
      modules: [],
      status: "unauthenticated",
    });
  });

  it("marks authenticated on login.fulfilled", () => {
    const state = authReducer(
      { user: null, organization: null, modules: [], status: "loading" },
      login.fulfilled(undefined, "", {
        email: "user@example.com",
        password: "secret",
      }),
    );

    expect(state.status).toBe("authenticated");
  });

  it("marks unauthenticated on login.rejected", () => {
    const state = authReducer(
      { user: null, organization: null, modules: [], status: "loading" },
      login.rejected(new Error("Invalid credentials"), "", {
        email: "user@example.com",
        password: "wrong",
      }),
    );

    expect(state.status).toBe("unauthenticated");
  });

  it("clears auth state on logout.fulfilled", () => {
    const state = authReducer(
      {
        user: mockMeResponse.user,
        organization: mockMeResponse.organization,
        modules: ["sales_erp"],
        status: "authenticated",
      },
      logout.fulfilled(undefined, "", undefined),
    );

    expect(state).toEqual({
      user: null,
      organization: null,
      modules: [],
      status: "unauthenticated",
    });
  });
});
