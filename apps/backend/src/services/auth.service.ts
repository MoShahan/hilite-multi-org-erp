import bcrypt from "bcrypt";
import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { signAccessToken } from "../lib/jwt";
import {
  assertUserHasRole,
  toAuthContext,
  toAuthMeResponse,
} from "../lib/authUserMapper";
import type { AuthMeResponse } from "../types/auth";
import { AppError } from "../utils/AppError";
import { authUserRepository } from "../repositories/user.repository";

const assertActiveUser = (
  user: NonNullable<Awaited<ReturnType<typeof authUserRepository.findByEmail>>>,
) => {
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

export const authService = {
  buildToken: (
    user: NonNullable<Awaited<ReturnType<typeof authUserRepository.findByEmail>>>,
  ) => {
    return signAccessToken({
      sub: user.id,
      orgId: user.organizationId,
    });
  },

  login: async (email: string, password: string) => {
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

    return {
      token: authService.buildToken(user),
      context: await toAuthContext(user),
    };
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

    return await toAuthContext(user);
  },
};
