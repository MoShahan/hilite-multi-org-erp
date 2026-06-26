import { describe, expect, it, vi } from "vitest";

import {
  createUser,
  fetchUsers,
  updateUserStatus,
  usersReducer,
} from "./usersSlice";
import { DEFAULT_LIST_QUERY } from "./userListParams";

import type { User } from "./usersTypes";

vi.mock("./usersService", () => ({
  usersService: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    updateUserStatus: vi.fn(),
  },
}));

const mockUser = (overrides?: Partial<User>): User => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  status: "ACTIVE",
  role: { id: "role-1", name: "Executive", slug: "executive" },
  team: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("usersSlice", () => {
  it("tracks list loading and success", () => {
    const query = DEFAULT_LIST_QUERY;
    const loading = usersReducer(undefined, fetchUsers.pending("", query));
    expect(loading.listStatus).toBe("loading");
    expect(loading.listQuery).toEqual(query);

    const success = usersReducer(
      loading,
      fetchUsers.fulfilled(
        {
          users: [mockUser()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        query,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.users).toHaveLength(1);
  });

  it("stores list errors", () => {
    const state = usersReducer(
      { ...usersReducer(undefined, { type: "@@INIT" }), listStatus: "loading" },
      fetchUsers.rejected(new Error("Failed"), "", DEFAULT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Failed");
  });

  it("tracks create user mutation lifecycle", () => {
    const pending = usersReducer(
      undefined,
      createUser.pending("", {
        email: "new@example.com",
        name: "New User",
        password: "Password@123",
        roleId: "role-1",
      }),
    );
    expect(pending.mutationStatus).toBe("loading");

    const fulfilled = usersReducer(
      pending,
      createUser.fulfilled(mockUser(), "", {
        email: "new@example.com",
        name: "New User",
        password: "Password@123",
        roleId: "role-1",
      }),
    );
    expect(fulfilled.mutationStatus).toBe("idle");
  });

  it("updates a user in the list after status change", () => {
    const original = mockUser({ status: "ACTIVE" });
    const updated = mockUser({ status: "INACTIVE" });
    const initial = {
      ...usersReducer(undefined, { type: "@@INIT" }),
      users: [original],
      mutationStatus: "loading" as const,
    };

    const state = usersReducer(
      initial,
      updateUserStatus.fulfilled(updated, "", {
        userId: "user-1",
        input: { status: "INACTIVE" },
      }),
    );

    expect(state.users[0]?.status).toBe("INACTIVE");
    expect(state.mutationStatus).toBe("idle");
  });
});
