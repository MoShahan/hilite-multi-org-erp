import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/role.repository", () => ({
  roleRepository: {
    findManyForOrganization: vi.fn(),
    findByIdForOrganization: vi.fn(),
    findBySlugForOrganization: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../repositories/permission.repository", () => ({
  permissionRepository: {
    findByKeys: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

import { PermissionScope, RoleMembershipScope } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { permissionRepository } from "../repositories/permission.repository";
import { roleRepository } from "../repositories/role.repository";
import { roleService } from "./role.service";
import { baseAuthUser, expectAppErrorAsync } from "../test/helpers";

const orgId = "org-1";

describe("roleService.createRole", () => {
  beforeEach(() => {
    vi.mocked(roleRepository.findBySlugForOrganization).mockReset();
    vi.mocked(permissionRepository.findByKeys).mockReset();
    vi.mocked(roleRepository.create).mockReset();
  });

  it("requires a role name", async () => {
    await expectAppErrorAsync(
      () => roleService.createRole(orgId, { name: "   " }),
      400,
      "BAD_REQUEST",
    );
  });

  it("rejects reserved slugs", async () => {
    await expectAppErrorAsync(
      () =>
        roleService.createRole(orgId, {
          name: "Org Admin",
          slug: "org_admin",
          membershipScope: "organization",
          permissions: [],
        }),
      400,
      "BAD_REQUEST",
    );
  });

  it("creates a role with validated permissions", async () => {
    vi.mocked(roleRepository.findBySlugForOrganization).mockResolvedValue(null);
    vi.mocked(permissionRepository.findByKeys).mockResolvedValue([
      {
        permissionKey: PERMISSIONS.LEADS_READ,
        scope: PermissionScope.ORGANIZATION,
      },
    ] as never);
    vi.mocked(roleRepository.create).mockResolvedValue({
      id: "role-custom",
      name: "Custom Role",
      slug: "custom_role",
      membershipScope: RoleMembershipScope.ORGANIZATION,
      permissions: [{ permissionKey: PERMISSIONS.LEADS_READ }],
      _count: { members: 0 },
    } as never);

    const result = await roleService.createRole(orgId, {
      name: "Custom Role",
      slug: "custom_role",
      membershipScope: "organization",
      permissions: [PERMISSIONS.LEADS_READ],
    });

    expect(result.role.slug).toBe("custom_role");
    expect(result.role.permissions).toEqual([PERMISSIONS.LEADS_READ]);
  });
});

describe("roleService.getRole", () => {
  beforeEach(() => {
    vi.mocked(roleRepository.findByIdForOrganization).mockReset();
  });

  it("returns not found for missing role", async () => {
    vi.mocked(roleRepository.findByIdForOrganization).mockResolvedValue(null);

    await expectAppErrorAsync(
      () =>
        roleService.getRole(
          orgId,
          "missing-role",
          baseAuthUser({ permissions: [PERMISSIONS.ROLES_READ] }),
        ),
      404,
      "NOT_FOUND",
    );
  });
});

describe("roleService.parseListQuery", () => {
  it("normalizes list query values", () => {
    const query = roleService.parseListQuery({
      assignableFrom: "team",
      membershipScope: "team",
    });

    expect(query.assignableFrom).toBe("team");
    expect(query.membershipScope).toBe("team");
  });
});
