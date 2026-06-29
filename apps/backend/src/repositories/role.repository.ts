import { prisma } from "../lib/prisma";

import type { Prisma, RoleMembershipScope } from "../generated/prisma/client";

const roleWithPermissionsInclude = {
  permissions: {
    select: {
      permissionKey: true,
    },
  },
  _count: {
    select: {
      members: true,
      userRoles: true,
    },
  },
} as const;

export type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: typeof roleWithPermissionsInclude;
}>;

export const roleRepository = {
  findManyByOrganization: (
    organizationId: string,
    filters: { membershipScope?: RoleMembershipScope } = {},
  ): Promise<RoleWithPermissions[]> => {
    return prisma.role.findMany({
      where: {
        organizationId,
        ...(filters.membershipScope
          ? { membershipScope: filters.membershipScope }
          : {}),
      },
      include: roleWithPermissionsInclude,
      orderBy: [{ name: "asc" }],
    });
  },

  findManyOptions: (
    organizationId: string,
    filters: { membershipScope?: RoleMembershipScope } = {},
    limit = 100,
  ) => {
    return prisma.role.findMany({
      where: {
        organizationId,
        ...(filters.membershipScope
          ? { membershipScope: filters.membershipScope }
          : {}),
      },
      select: { id: true, name: true, slug: true, membershipScope: true },
      orderBy: [{ name: "asc" }],
      take: limit,
    });
  },

  findByIdForOrganization: (
    id: string,
    organizationId: string,
  ): Promise<RoleWithPermissions | null> => {
    return prisma.role.findFirst({
      where: { id, organizationId },
      include: roleWithPermissionsInclude,
    });
  },

  findBySlugForOrganization: (
    organizationId: string,
    slug: string,
  ): Promise<RoleWithPermissions | null> => {
    return prisma.role.findFirst({
      where: { organizationId, slug },
      include: roleWithPermissionsInclude,
    });
  },

  create: async (data: {
    organizationId: string;
    name: string;
    slug: string;
    membershipScope: RoleMembershipScope;
    permissionKeys: string[];
  }): Promise<RoleWithPermissions> => {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          slug: data.slug,
          membershipScope: data.membershipScope,
        },
      });

      if (data.permissionKeys.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionKeys.map((permissionKey) => ({
            roleId: role.id,
            permissionKey,
          })),
        });
      }

      return tx.role.findUniqueOrThrow({
        where: { id: role.id },
        include: roleWithPermissionsInclude,
      });
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      permissionKeys?: string[];
    },
  ): Promise<RoleWithPermissions> => {
    return prisma.$transaction(async (tx) => {
      if (data.name !== undefined) {
        await tx.role.update({
          where: { id },
          data: { name: data.name },
        });
      }

      if (data.permissionKeys !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });

        if (data.permissionKeys.length > 0) {
          await tx.rolePermission.createMany({
            data: data.permissionKeys.map((permissionKey) => ({
              roleId: id,
              permissionKey,
            })),
          });
        }
      }

      return tx.role.findUniqueOrThrow({
        where: { id },
        include: roleWithPermissionsInclude,
      });
    });
  },

  delete: (id: string) => {
    return prisma.role.delete({ where: { id } });
  },
};

export { roleWithPermissionsInclude };
