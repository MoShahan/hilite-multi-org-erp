import {
  ALL_ORG_MODULE_KEYS,
  fromDbModuleKey,
  toDbModuleKey,
} from "../constants/orgModules";
import { ModuleKey, type Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { seedDefaultModulesForOrg } from "../lib/seedOrganizationModules";

import type { OrgModuleKey } from "../constants/orgModules";

type TransactionClient = Prisma.TransactionClient;

export const organizationModuleRepository = {
  findByOrganizationId: async (organizationId: string) => {
    return prisma.organizationModule.findMany({
      where: { organizationId },
    });
  },

  findEnabledByOrganizationId: async (
    organizationId: string,
  ): Promise<ModuleKey[]> => {
    const rows = await prisma.organizationModule.findMany({
      where: { organizationId, enabled: true },
      select: { moduleKey: true },
    });

    return rows.map((row) => row.moduleKey);
  },

  isModuleEnabled: async (
    organizationId: string,
    moduleKey: OrgModuleKey,
  ): Promise<boolean> => {
    const row = await prisma.organizationModule.findUnique({
      where: {
        organizationId_moduleKey: {
          organizationId,
          moduleKey: toDbModuleKey(moduleKey),
        },
      },
      select: { enabled: true },
    });

    return row?.enabled ?? false;
  },

  seedDefaultsForOrg: seedDefaultModulesForOrg,

  upsertModules: async (
    organizationId: string,
    updates: Partial<Record<OrgModuleKey, boolean>>,
    tx?: TransactionClient,
  ) => {
    const client = tx ?? prisma;

    for (const [key, enabled] of Object.entries(updates)) {
      if (enabled === undefined) {
        continue;
      }

      const moduleKey = toDbModuleKey(key as OrgModuleKey);

      await client.organizationModule.upsert({
        where: {
          organizationId_moduleKey: {
            organizationId,
            moduleKey,
          },
        },
        update: { enabled },
        create: {
          organizationId,
          moduleKey,
          enabled,
        },
      });
    }
  },

  toModulesMap: (
    rows: { moduleKey: ModuleKey; enabled: boolean }[],
  ): Record<OrgModuleKey, boolean> => {
    const map = Object.fromEntries(
      ALL_ORG_MODULE_KEYS.map((key) => [key, false]),
    ) as Record<OrgModuleKey, boolean>;

    for (const row of rows) {
      map[fromDbModuleKey(row.moduleKey)] = row.enabled;
    }

    return map;
  },
};
