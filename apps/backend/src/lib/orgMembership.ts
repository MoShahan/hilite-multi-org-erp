import { UserStatus } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";

import type { Prisma } from "../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export const assignOrgMembership = async (
  tx: TransactionClient,
  data: {
    userId: string;
    organizationId: string;
    roleId: string;
    status?: UserStatus;
  },
) => {
  return tx.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: data.userId,
        organizationId: data.organizationId,
      },
    },
    create: {
      userId: data.userId,
      organizationId: data.organizationId,
      roleId: data.roleId,
      status: data.status ?? UserStatus.ACTIVE,
    },
    update: {
      roleId: data.roleId,
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
};

export const assignOrgMembershipBySlug = async (
  tx: TransactionClient,
  userId: string,
  organizationId: string,
  slug: string,
) => {
  const role = await tx.role.findFirst({
    where: {
      organizationId,
      slug,
    },
  });

  if (!role) {
    throw new Error(`Role not found: ${slug}`);
  }

  await assignOrgMembership(tx, {
    userId,
    organizationId,
    roleId: role.id,
  });

  return role;
};

export const getOrgMembershipOrThrow = async (
  client: TransactionClient | typeof import("../lib/prisma").prisma,
  userId: string,
  organizationId: string,
) => {
  const membership = await client.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    include: {
      organization: true,
      role: {
        include: {
          permissions: true,
        },
      },
      teamMember: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!membership) {
    throw AppError.unauthorized();
  }

  return membership;
};

export const resolveLoginOrgId = (
  memberships: { organizationId: string; status: UserStatus }[],
): string | null => {
  const activeMemberships = memberships.filter(
    (membership) => membership.status === UserStatus.ACTIVE,
  );

  if (activeMemberships.length === 0) {
    return null;
  }

  if (activeMemberships.length > 1) {
    throw new AppError(
      403,
      "ORG_SELECTION_REQUIRED",
      "Organization selection is required",
    );
  }

  return activeMemberships[0]!.organizationId;
};
