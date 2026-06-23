import { PermissionScope, type Prisma } from "../generated/prisma/client";
import { PERMISSION_CATALOG } from "../constants/permissionCatalog";

type TransactionClient = Prisma.TransactionClient;

export const seedPermissions = async (tx: TransactionClient) => {
  await Promise.all(
    PERMISSION_CATALOG.map((entry) =>
      tx.permission.upsert({
        where: { key: entry.key },
        create: {
          key: entry.key,
          label: entry.label,
          description: entry.description ?? null,
          scope:
            entry.scope === "PLATFORM"
              ? PermissionScope.PLATFORM
              : PermissionScope.ORGANIZATION,
        },
        update: {
          label: entry.label,
          description: entry.description ?? null,
          scope:
            entry.scope === "PLATFORM"
              ? PermissionScope.PLATFORM
              : PermissionScope.ORGANIZATION,
        },
      }),
    ),
  );
};
