import type { Prisma } from "../generated/prisma/client";
import { userWithAuthInclude } from "../lib/authUserMapper";
import { prisma } from "../lib/prisma";

const refreshTokenInclude = {
  user: {
    include: userWithAuthInclude,
  },
} satisfies Prisma.RefreshTokenInclude;

export type RefreshTokenRecord = Prisma.RefreshTokenGetPayload<{
  include: typeof refreshTokenInclude;
}>;

export type CreateRefreshTokenInput = {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
};

export const refreshTokenRepository = {
  create: (input: CreateRefreshTokenInput) => {
    return prisma.refreshToken.create({
      data: input,
    });
  },

  findByHash: (tokenHash: string): Promise<RefreshTokenRecord | null> => {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: refreshTokenInclude,
    });
  },

  findActiveByHash: (tokenHash: string): Promise<RefreshTokenRecord | null> => {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: refreshTokenInclude,
    });
  },

  revokeById: (id: string) => {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeFamily: (familyId: string) => {
    return prisma.refreshToken.updateMany({
      where: {
        familyId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllForUser: (userId: string) => {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  },
};
