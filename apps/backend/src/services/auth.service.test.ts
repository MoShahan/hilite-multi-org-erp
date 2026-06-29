import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";

vi.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-jwt-secret",
    jwtExpiresIn: "1d",
    refreshTokenExpiresIn: "7d",
  },
}));

vi.mock("../repositories/user.repository", () => ({
  authUserRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    updateProfile: vi.fn(),
    updatePasswordHash: vi.fn(),
  },
}));

vi.mock("../repositories/refreshToken.repository", () => ({
  refreshTokenRepository: {
    create: vi.fn(),
    findByHash: vi.fn(),
    revokeById: vi.fn(),
    revokeFamily: vi.fn(),
  },
}));

vi.mock("../services/welcomeNotification.service", () => ({
  welcomeNotificationService: {
    ensureOnLogin: vi.fn(),
  },
}));

vi.mock("../services/organizationModule.service", () => ({
  organizationModuleService: {
    getEnabledModuleKeys: vi.fn().mockResolvedValue([]),
  },
}));

import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { authUserRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { welcomeNotificationService } from "../services/welcomeNotification.service";
import { authService } from "./auth.service";
import { expectAppErrorAsync } from "../test/helpers";
import type { UserWithAuthRelations } from "../lib/authUserMapper";

const password = "ValidPass1!";
const orgId = "org-1";

const authUserRecord = (
  overrides?: Partial<UserWithAuthRelations & { passwordHash: string; mustChangePassword: boolean }>,
) => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  phoneNumber: null,
  passwordHash: overrides?.passwordHash ?? "hashed",
  mustChangePassword: false,
  status: UserStatus.ACTIVE,
  memberships: [
    {
      status: UserStatus.ACTIVE,
      organization: {
        id: orgId,
        name: "Test Org",
        code: "TEST",
        status: OrganizationStatus.ACTIVE,
      },
      role: {
        id: "role-1",
        name: "Org Admin",
        slug: "org_admin",
        permissions: [],
      },
      teamMember: null,
    },
  ],
  userRole: null,
  ...overrides,
});

describe("authService.login", () => {
  beforeEach(() => {
    vi.mocked(authUserRepository.findByEmail).mockReset();
    vi.mocked(refreshTokenRepository.create).mockReset();
    vi.mocked(welcomeNotificationService.ensureOnLogin).mockReset();
    vi.mocked(refreshTokenRepository.create).mockResolvedValue({} as never);
    vi.mocked(welcomeNotificationService.ensureOnLogin).mockResolvedValue();
  });

  it("issues a session for valid credentials", async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    vi.mocked(authUserRepository.findByEmail).mockResolvedValue(
      authUserRecord({ passwordHash }) as never,
    );

    const session = await authService.login("user@example.com", password);

    expect(session.accessToken).toBeTruthy();
    expect(session.refreshTokenRaw).toBeTruthy();
    expect(session.context.user.email).toBe("user@example.com");
    expect(refreshTokenRepository.create).toHaveBeenCalledOnce();
    expect(welcomeNotificationService.ensureOnLogin).toHaveBeenCalledOnce();
  });

  it("rejects unknown email", async () => {
    vi.mocked(authUserRepository.findByEmail).mockResolvedValue(null);

    await expectAppErrorAsync(
      () => authService.login("missing@example.com", password),
      401,
      "UNAUTHORIZED",
    );
  });

  it("rejects invalid password", async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    vi.mocked(authUserRepository.findByEmail).mockResolvedValue(
      authUserRecord({ passwordHash }) as never,
    );

    await expectAppErrorAsync(
      () => authService.login("user@example.com", "WrongPass1!"),
      401,
      "UNAUTHORIZED",
    );
  });
});

describe("authService.updateProfile", () => {
  beforeEach(() => {
    vi.mocked(authUserRepository.findById).mockReset();
    vi.mocked(authUserRepository.updateProfile).mockReset();
  });

  it("requires a name", async () => {
    await expectAppErrorAsync(
      () => authService.updateProfile("user-1", orgId, { name: "   " }),
      400,
      "BAD_REQUEST",
    );
  });

  it("returns current profile when nothing changes", async () => {
    vi.mocked(authUserRepository.findById).mockResolvedValue(
      authUserRecord() as never,
    );

    const response = await authService.updateProfile("user-1", orgId, {
      name: "Test User",
      phoneNumber: null,
    });

    expect(response.user.name).toBe("Test User");
    expect(authUserRepository.updateProfile).not.toHaveBeenCalled();
  });
});

describe("authService.changePassword", () => {
  beforeEach(() => {
    vi.mocked(authUserRepository.findById).mockReset();
    vi.mocked(authUserRepository.updatePasswordHash).mockReset();
  });

  it("requires current password", async () => {
    await expectAppErrorAsync(
      () =>
        authService.changePassword("user-1", {
          currentPassword: "",
          newPassword: "NewValidPass1!",
        }),
      400,
      "BAD_REQUEST",
    );
  });

  it("rejects incorrect current password", async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    vi.mocked(authUserRepository.findById).mockResolvedValue(
      authUserRecord({ passwordHash }) as never,
    );

    await expectAppErrorAsync(
      () =>
        authService.changePassword("user-1", {
          currentPassword: "WrongPass1!",
          newPassword: "NewValidPass1!",
        }),
      400,
      "BAD_REQUEST",
    );
  });
});
