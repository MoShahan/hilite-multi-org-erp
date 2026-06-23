import type { Prisma } from "../generated/prisma/client";
import {
  DEFAULT_ORG_ROLES,
  PLATFORM_ROLE,
  type DefaultRoleDefinition,
} from "../constants/defaultRoles";
import { toPrismaRoleMembershipScope } from "./roleMembershipScope";

type TransactionClient = Prisma.TransactionClient;

const createRoleWithPermissions = async (
  tx: TransactionClient,
  organizationId: string | null,
  definition: DefaultRoleDefinition,
) => {
  const role = await tx.role.create({
    data: {
      organizationId,
      name: definition.name,
      slug: definition.slug,
      membershipScope: toPrismaRoleMembershipScope(definition.membershipScope),
    },
  });

  if (definition.permissions.length > 0) {
    await tx.rolePermission.createMany({
      data: definition.permissions.map((permissionKey) => ({
        roleId: role.id,
        permissionKey,
      })),
    });
  }

  return role;
};

export const seedPlatformRole = async (tx: TransactionClient) => {
  const existing = await tx.role.findFirst({
    where: {
      organizationId: null,
      slug: PLATFORM_ROLE.slug,
    },
  });

  if (existing) {
    return existing;
  }

  return createRoleWithPermissions(tx, null, PLATFORM_ROLE);
};

export const seedDefaultRolesForOrg = async (
  tx: TransactionClient,
  organizationId: string,
) => {
  const roles: Awaited<ReturnType<typeof createRoleWithPermissions>>[] = [];

  for (const definition of DEFAULT_ORG_ROLES) {
    const existing = await tx.role.findFirst({
      where: {
        organizationId,
        slug: definition.slug,
      },
    });

    if (existing) {
      roles.push(existing);
      continue;
    }

    const role = await createRoleWithPermissions(tx, organizationId, definition);
    roles.push(role);
  }

  return roles;
};

export const assignRoleToUserBySlug = async (
  tx: TransactionClient,
  userId: string,
  organizationId: string | null,
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

  await tx.userRoleAssignment.upsert({
    where: { userId },
    create: { userId, roleId: role.id },
    update: { roleId: role.id },
  });

  return role;
};
