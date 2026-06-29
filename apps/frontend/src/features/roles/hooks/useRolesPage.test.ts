import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRolesPage } from "./useRolesPage";
import { rolesService } from "../rolesService";
import { authenticatedState, mockUser } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

import type { PermissionCatalogItem, Role } from "../rolesTypes";

vi.mock("../rolesService", () => ({
  rolesService: {
    listRoles: vi.fn(),
    listPermissions: vi.fn(),
    updateRole: vi.fn(),
  },
}));

const mockRole = (overrides?: Partial<Role>): Role => ({
  id: "role-1",
  name: "Executive",
  slug: "executive",
  membershipScope: "organization",
  requiresTeamMembership: false,
  assignableFrom: ["users"],
  permissions: ["leads:read"],
  userCount: 1,
  isProtected: false,
  canDelete: true,
  ...overrides,
});

const mockPermission = (
  overrides?: Partial<PermissionCatalogItem>,
): PermissionCatalogItem => ({
  key: "leads:read",
  label: "Read leads",
  description: null,
  scope: "ORGANIZATION",
  ...overrides,
});

describe("useRolesPage", () => {
  beforeEach(() => {
    vi.mocked(rolesService.listRoles).mockResolvedValue([mockRole()]);
    vi.mocked(rolesService.listPermissions).mockResolvedValue([mockPermission()]);
    vi.mocked(rolesService.updateRole).mockResolvedValue(
      mockRole({ permissions: ["leads:read", "leads:write"] }),
    );
  });

  it("loads roles and permissions on mount", async () => {
    const { result } = renderHookWithProviders(() => useRolesPage(), {
      preloadedState: authenticatedState(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.roles).toHaveLength(1);
    expect(result.current.permissions).toHaveLength(1);
    expect(result.current.selectedRoleId).toBe("role-1");
  });

  it("uses team-scoped list options when only team role read is available", async () => {
    renderHookWithProviders(() => useRolesPage(), {
      preloadedState: authenticatedState({
        user: mockUser({ permissions: ["roles:read:team"] }),
      }),
    });

    await waitFor(() => {
      expect(rolesService.listRoles).toHaveBeenCalledWith({ assignableFrom: "team" });
    });
  });

  it("tracks dirty state when draft permissions change", async () => {
    const { result } = renderHookWithProviders(() => useRolesPage(), {
      preloadedState: authenticatedState(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.togglePermission("leads:write", true);
    });

    expect(result.current.isDirty).toBe(true);
  });

  it("discards draft permission changes", async () => {
    const { result } = renderHookWithProviders(() => useRolesPage(), {
      preloadedState: authenticatedState(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    act(() => {
      result.current.togglePermission("leads:write", true);
      result.current.discardChanges();
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.draftPermissions).toEqual(["leads:read"]);
  });

  it("re-selects the first remaining role after delete", async () => {
    const roles = [
      mockRole({ id: "role-1", name: "Alpha" }),
      mockRole({ id: "role-2", name: "Beta", permissions: ["users:read"] }),
    ];
    vi.mocked(rolesService.listRoles).mockResolvedValue(roles);

    const { result } = renderHookWithProviders(() => useRolesPage(), {
      preloadedState: authenticatedState(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    act(() => {
      result.current.selectRole("role-2");
      result.current.removeRole("role-2");
    });

    expect(result.current.selectedRoleId).toBe("role-1");
    expect(result.current.roles).toHaveLength(1);
  });
});
