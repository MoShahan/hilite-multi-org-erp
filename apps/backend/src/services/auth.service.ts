import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { signAccessToken } from "../lib/jwt";
import {
  assertUserHasRole,
  toAuthContext,
  toAuthMeResponse,
} from "../lib/authUserMapper";
import { parseOptionalPhoneNumber } from "../lib/phoneNumber";
import { assertPasswordStrength } from "../lib/password";
import {
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from "../lib/refreshToken";
import type {
  AuthContext,
  AuthMeResponse,
  ChangePasswordInput,
  UpdateProfileInput,
} from "../types/auth";
import type { AuditRequestContext } from "../types/audit";
import { AppError } from "../utils/AppError";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { authUserRepository } from "../repositories/user.repository";
import { welcomeNotificationService } from "./welcomeNotification.service";

type AuthUserRecord = NonNullable<
  Awaited<ReturnType<typeof authUserRepository.findByEmail>>
>;

export type SessionTokens = {
  accessToken: string;
  refreshTokenRaw: string;
  context: AuthContext;
};

const assertActiveUser = (user: AuthUserRecord) => {
  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "ACCOUNT_INACTIVE", "Your account is inactive");
  }

  if (user.organizationId) {
    if (!user.organization) {
      throw new AppError(403, "ORG_SUSPENDED", "Your organization is suspended");
    }

    if (user.organization.status !== OrganizationStatus.ACTIVE) {
      throw new AppError(403, "ORG_SUSPENDED", "Your organization is suspended");
    }
  }
};

const toRequestMetadata = (requestContext?: AuditRequestContext) => ({
  userAgent: requestContext?.userAgent,
  ip: requestContext?.ip,
});

const SALT_ROUNDS = 10;

export const authService = {
  buildToken: (user: AuthUserRecord) => {
    return signAccessToken({
      sub: user.id,
      orgId: user.organizationId,
    });
  },

  issueSession: async (
    user: AuthUserRecord,
    requestContext?: AuditRequestContext,
  ): Promise<SessionTokens> => {
    const accessToken = authService.buildToken(user);
    const refreshTokenRaw = generateRefreshToken();
    const requestMetadata = toRequestMetadata(requestContext);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashRefreshToken(refreshTokenRaw),
      familyId: randomUUID(),
      expiresAt: getRefreshTokenExpiresAt(),
      ...requestMetadata,
    });

    return {
      accessToken,
      refreshTokenRaw,
      context: await toAuthContext(user),
    };
  },

  login: async (
    email: string,
    password: string,
    requestContext?: AuditRequestContext,
  ) => {
    const user = await authUserRepository.findByEmail(email.trim().toLowerCase());

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    assertActiveUser(user);
    assertUserHasRole(user);

    await welcomeNotificationService.ensureOnLogin(
      user.id,
      user.organizationId,
      user.name,
      user.mustChangePassword,
    );

    return authService.issueSession(user, requestContext);
  },

  refreshSession: async (
    rawRefreshToken: string,
    requestContext?: AuditRequestContext,
  ): Promise<SessionTokens> => {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const existing = await refreshTokenRepository.findByHash(tokenHash);

    if (!existing) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
    }

    if (existing.revokedAt) {
      await refreshTokenRepository.revokeFamily(existing.familyId);
      throw new AppError(
        401,
        "REFRESH_TOKEN_REUSE",
        "Refresh token reuse detected",
      );
    }

    if (existing.expiresAt <= new Date()) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token expired");
    }

    assertActiveUser(existing.user);
    assertUserHasRole(existing.user);

    await refreshTokenRepository.revokeById(existing.id);

    const refreshTokenRaw = generateRefreshToken();
    const requestMetadata = toRequestMetadata(requestContext);

    await refreshTokenRepository.create({
      userId: existing.user.id,
      tokenHash: hashRefreshToken(refreshTokenRaw),
      familyId: existing.familyId,
      expiresAt: getRefreshTokenExpiresAt(),
      ...requestMetadata,
    });

    return {
      accessToken: authService.buildToken(existing.user),
      refreshTokenRaw,
      context: await toAuthContext(existing.user),
    };
  },

  revokeSession: async (rawRefreshToken: string) => {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const existing = await refreshTokenRepository.findByHash(tokenHash);

    if (!existing || existing.revokedAt) {
      return null;
    }

    await refreshTokenRepository.revokeById(existing.id);
    return existing.user;
  },

  getMe: async (userId: string): Promise<AuthMeResponse> => {
    const user = await authUserRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    assertActiveUser(user);

    return toAuthMeResponse(await toAuthContext(user));
  },

  resolveAuthContext: async (userId: string) => {
    const user = await authUserRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    assertActiveUser(user);

    return toAuthContext(user);
  },

  updateProfile: async (
    userId: string,
    input: UpdateProfileInput,
  ): Promise<AuthMeResponse> => {
    const name = input.name?.trim();
    const phoneNumber = parseOptionalPhoneNumber(input.phoneNumber);

    if (!name) {
      throw AppError.badRequest("Name is required", [
        { field: "name", message: "Name is required" },
      ]);
    }

    const existing = await authUserRepository.findById(userId);

    if (!existing) {
      throw AppError.unauthorized();
    }

    assertActiveUser(existing);

    if (existing.name === name && existing.phoneNumber === phoneNumber) {
      return toAuthMeResponse(await toAuthContext(existing));
    }

    const user = await authUserRepository.updateProfile(userId, {
      name,
      phoneNumber,
    });

    return toAuthMeResponse(await toAuthContext(user));
  },

  changePassword: async (
    userId: string,
    input: ChangePasswordInput,
  ): Promise<{ message: string }> => {
    const currentPassword = input.currentPassword;
    const newPassword = input.newPassword;

    if (!currentPassword) {
      throw AppError.badRequest("Current password is required", [
        { field: "currentPassword", message: "Current password is required" },
      ]);
    }

    assertPasswordStrength(newPassword ?? "", "newPassword");

    const user = await authUserRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    assertActiveUser(user);

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw AppError.badRequest("Current password is incorrect", [
        {
          field: "currentPassword",
          message: "Current password is incorrect",
        },
      ]);
    }

    if (currentPassword === newPassword) {
      throw AppError.badRequest(
        "New password must be different from current password",
        [
          {
            field: "newPassword",
            message: "New password must be different from current password",
          },
        ],
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authUserRepository.updatePasswordHash(userId, passwordHash);

    return { message: "Password updated" };
  },
};
