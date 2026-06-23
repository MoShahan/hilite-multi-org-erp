import { ModuleKey, type Prisma } from "../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

const DEFAULT_MODULE_KEYS = [
  ModuleKey.SALES_ERP,
  ModuleKey.DASHBOARDS,
  ModuleKey.NOTIFICATIONS,
] as const;

export const seedDefaultModulesForOrg = async (
  tx: TransactionClient,
  organizationId: string,
): Promise<void> => {
  for (const moduleKey of DEFAULT_MODULE_KEYS) {
    await tx.organizationModule.upsert({
      where: {
        organizationId_moduleKey: {
          organizationId,
          moduleKey,
        },
      },
      update: {},
      create: {
        organizationId,
        moduleKey,
        enabled: true,
      },
    });
  }
};
