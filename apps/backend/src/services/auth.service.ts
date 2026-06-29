import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { signAccessToken } from "../lib/jwt";
import { toAuthContext, toAuthMeResponse } from "../lib/authUserMapper";
import {
  assertActiveUser,
  assertUserHasAccess,
  resolveSessionOrgId,
} from "../lib/authSession";
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

const toRequestMetadata = (requestContext?: AuditRequestContext) => ({
  userAgent: requestContext?.userAgent,
  ip: requestContext?.ip,
});

const SALT_ROUNDS = 10;

const issueSessionForUser = async (
  user: AuthUserRecord,
  organizationId: string | null,
  requestContext?: AuditRequestContext,
): Promise<SessionTokens> => {
  const accessToken = signAccessToken({
    sub: user.id,
    orgId: organizationId,
  });
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
    context: await toAuthContext(user, organizationId),
  };
};

export const authService = {
  buildToken: (user: AuthUserRecord, organizationId?: string | null) => {
    const orgId = resolveSessionOrgId(user, organizationId);

    return signAccessToken({
      sub: user.id,
      orgId,
    });
  },

  issueSession: async (
    user: AuthUserRecord,
    requestContext?: AuditRequestContext,
    organizationId?: string | null,
  ): Promise<SessionTokens> => {
    const orgId = resolveSessionOrgId(user, organizationId);
    assertActiveUser(user, orgId);
    assertUserHasAccess(user, orgId);

    return issueSessionForUser(user, orgId, requestContext);
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

    const orgId = resolveSessionOrgId(user);
    assertActiveUser(user, orgId);
    assertUserHasAccess(user, orgId);

    await welcomeNotificationService.ensureOnLogin(
      user.id,
      orgId,
      user.name,
      user.mustChangePassword,
    );

    return issueSessionForUser(user, orgId, requestContext);
  },

  refreshSession: async (
    rawRefreshToken: string,
    requestContext?: AuditRequestContext,
    organizationId?: string | null,
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

    const orgId = resolveSessionOrgId(existing.user, organizationId);
    assertActiveUser(existing.user, orgId);
    assertUserHasAccess(existing.user, orgId);

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
      accessToken: authService.buildToken(existing.user, orgId),
      refreshTokenRaw,
      context: await toAuthContext(existing.user, orgId),
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

  getMe: async (
    userId: string,
    organizationId: string | null,
  ): Promise<AuthMeResponse> => {
    const user = await authUserRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    assertActiveUser(user, organizationId);

    return toAuthMeResponse(await toAuthContext(user, organizationId));
  },

  resolveAuthContext: async (
    userId: string,
    organizationId: string | null,
  ) => {
    const user = await authUserRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    assertActiveUser(user, organizationId);

    return toAuthContext(user, organizationId);
  },

  updateProfile: async (
    userId: string,
    organizationId: string | null,
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

    assertActiveUser(existing, organizationId);

    if (existing.name === name && existing.phoneNumber === phoneNumber) {
      return toAuthMeResponse(await toAuthContext(existing, organizationId));
    }

    const user = await authUserRepository.updateProfile(userId, {
      name,
      phoneNumber,
    });

    return toAuthMeResponse(await toAuthContext(user, organizationId));
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

    const orgId = resolveSessionOrgId(user);
    assertActiveUser(user, orgId);

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
