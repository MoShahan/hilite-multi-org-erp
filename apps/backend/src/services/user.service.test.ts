import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {},
}));

vi.mock("../repositories/user.repository", () => ({
  authUserRepository: {
    emailExists: vi.fn(),
  },
  orgUserRepository: {
    findManyPaginated: vi.fn(),
    findMembershipByEmail: vi.fn(),
    findRoleForOrganization: vi.fn(),
    createWithRole: vi.fn(),
    findByIdForOrganization: vi.fn(),
    updateMembershipStatus: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

vi.mock("./welcomeNotification.service", () => ({
  welcomeNotificationService: {
    ensureOnCreate: vi.fn(),
  },
}));

import { RoleMembershipScope, UserStatus } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { orgUserRepository } from "../repositories/user.repository";
import { orgUserService } from "./user.service";
import { baseAuthUser, expectAppErrorAsync } from "../test/helpers";

const orgId = "org-1";

describe("orgUserService.listUsers", () => {
  beforeEach(() => {
    vi.mocked(orgUserRepository.findManyPaginated).mockReset();
    vi.mocked(orgUserRepository.findManyPaginated).mockResolvedValue({
      members: [],
      total: 0,
    });
  });

  it("requires organization context", async () => {
    await expectAppErrorAsync(
      () => orgUserService.listUsers(null, baseAuthUser(), {}),
      403,
      "FORBIDDEN",
    );
  });

  it("forbids callers without user read permissions", async () => {
    await expectAppErrorAsync(
      () => orgUserService.listUsers(orgId, baseAuthUser(), {}),
      403,
      "FORBIDDEN",
    );
  });

  it("returns paginated users for org readers", async () => {
    const result = await orgUserService.listUsers(
      orgId,
      baseAuthUser({ permissions: [PERMISSIONS.USERS_READ] }),
      {},
    );

    expect(result.users).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it("requires team id for lead-assignment listing", async () => {
    await expectAppErrorAsync(
      () =>
        orgUserService.listUsers(
          orgId,
          baseAuthUser({ permissions: [PERMISSIONS.LEADS_WRITE] }),
          { for: "lead-assignment" },
        ),
      400,
      "BAD_REQUEST",
    );
  });
});

describe("orgUserService.createUser", () => {
  beforeEach(() => {
    vi.mocked(orgUserRepository.findMembershipByEmail).mockReset();
    vi.mocked(orgUserRepository.findRoleForOrganization).mockReset();
  });

  it("validates required fields", async () => {
    await expectAppErrorAsync(
      () => orgUserService.createUser(orgId, {} as never),
      400,
      "BAD_REQUEST",
    );
  });

  it("rejects team-scoped roles from users page", async () => {
    vi.mocked(orgUserRepository.findMembershipByEmail).mockResolvedValue(null);
    vi.mocked(orgUserRepository.findRoleForOrganization).mockResolvedValue({
      id: "role-1",
      slug: "executive",
      membershipScope: RoleMembershipScope.TEAM,
    } as never);

    await expectAppErrorAsync(
      () =>
        orgUserService.createUser(orgId, {
          name: "New User",
          email: "new@example.com",
          password: "ValidPass1!",
          roleId: "role-1",
        }),
      400,
      "BAD_REQUEST",
    );
  });
});

describe("orgUserService.updateUserStatus", () => {
  beforeEach(() => {
    vi.mocked(orgUserRepository.findByIdForOrganization).mockReset();
    vi.mocked(orgUserRepository.updateMembershipStatus).mockReset();
  });

  it("rejects self deactivation", async () => {
    vi.mocked(orgUserRepository.findByIdForOrganization).mockResolvedValue({
      status: UserStatus.ACTIVE,
      role: { slug: "executive" },
      user: { id: "user-1", name: "Test", email: "user@example.com", createdAt: new Date() },
    } as never);

    await expectAppErrorAsync(
      () =>
        orgUserService.updateUserStatus(
          orgId,
          "user-1",
          "user-1",
          { status: UserStatus.INACTIVE },
        ),
      400,
      "BAD_REQUEST",
    );
  });
});
