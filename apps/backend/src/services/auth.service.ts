import bcrypt from "bcrypt";
import {
  OrganizationStatus,
  UserStatus,
  type User,
  type Organization,
} from "../generated/prisma/client";
import { signAccessToken } from "../lib/jwt";
import type { AuthContext, AuthMeResponse } from "../types/auth";
import { AppError } from "../utils/AppError";
import { userRepository } from "../repositories/user.repository";

type UserWithOrganization = User & {
  organization: Organization | null;
};

const toAuthUser = (user: UserWithOrganization) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  organizationId: user.organizationId,
});

const toAuthOrganization = (organization: Organization | null) => {
  if (!organization) {
    return null;
  }

  return {
    id: organization.id,
    name: organization.name,
    code: organization.code,
    status: organization.status,
  };
};

const assertActiveUser = (user: UserWithOrganization) => {
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

const toAuthContext = (user: UserWithOrganization): AuthContext => {
  assertActiveUser(user);

  return {
    user: toAuthUser(user),
    organization: toAuthOrganization(user.organization),
  };
};

export const authService = {
  buildToken: (user: UserWithOrganization) => {
    return signAccessToken({
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
    });
  },

  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    assertActiveUser(user);

    return {
      token: authService.buildToken(user),
      context: toAuthContext(user),
    };
  },

  getMe: async (userId: string): Promise<AuthMeResponse> => {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    const context = toAuthContext(user);

    return {
      user: context.user,
      organization: context.organization,
      modules: [],
    };
  },

  resolveAuthContext: async (userId: string): Promise<AuthContext> => {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw AppError.unauthorized();
    }

    return toAuthContext(user);
  },
};
