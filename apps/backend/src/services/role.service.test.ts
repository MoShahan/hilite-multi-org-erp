import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/role.repository", () => ({
  roleRepository: {
    findManyByOrganization: vi.fn(),
    findManyOptions: vi.fn(),
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

import { RoleMembershipScope } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { roleRepository } from "../repositories/role.repository";
import { roleService } from "./role.service";
import { baseAuthUser } from "../test/helpers";

const orgId = "org-1";

describe("roleService.listRoleOptions", () => {
  beforeEach(() => {
    vi.mocked(roleRepository.findManyOptions).mockReset();
    vi.mocked(roleRepository.findManyOptions).mockResolvedValue([]);
  });

  it("returns role options", async () => {
    vi.mocked(roleRepository.findManyOptions).mockResolvedValue([
      {
        id: "role-1",
        name: "Executive",
        slug: "executive",
        membershipScope: RoleMembershipScope.TEAM,
      },
    ]);

    const result = await roleService.listRoleOptions(
      orgId,
      { assignableFrom: "team" },
      baseAuthUser({ permissions: [PERMISSIONS.ROLES_READ] }),
    );

    expect(result.roles).toEqual([
      { id: "role-1", name: "Executive", slug: "executive" },
    ]);
  });
});
