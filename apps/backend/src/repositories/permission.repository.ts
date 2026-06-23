import { PermissionScope } from "../generated/prisma/client";
import { PERMISSION_CATALOG_ORDER } from "../constants/permissionCatalog";
import { prisma } from "../lib/prisma";

export const permissionRepository = {
  findAll: async (scope?: PermissionScope) => {
    const permissions = await prisma.permission.findMany({
      where: scope ? { scope } : undefined,
    });

    const orderMap = new Map(
      PERMISSION_CATALOG_ORDER.map((key, index) => [key, index]),
    );

    return permissions.sort(
      (a, b) =>
        (orderMap.get(a.key as (typeof PERMISSION_CATALOG_ORDER)[number]) ??
          Number.MAX_SAFE_INTEGER) -
        (orderMap.get(b.key as (typeof PERMISSION_CATALOG_ORDER)[number]) ??
          Number.MAX_SAFE_INTEGER),
    );
  },

  findByKeys: async (keys: string[]) => {
    if (keys.length === 0) {
      return [];
    }

    return prisma.permission.findMany({
      where: { key: { in: keys } },
    });
  },
};
