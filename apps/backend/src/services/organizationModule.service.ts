import {
  ALL_ORG_MODULE_KEYS,
  fromDbModuleKey,
  ORG_MODULE_CATALOG,
  ORG_MODULE_KEYS,
  type OrgModuleKey,
} from "../constants/orgModules";
import { buildActorSnapshot } from "../lib/auditHelpers";
import { organizationModuleRepository } from "../repositories/organizationModule.repository";
import { AppError } from "../utils/AppError";

import { auditService } from "./audit.service";

import type { AuditMutationContext } from "../types/audit";
import type {
  OrgModulesMap,
  OrgModulesResponse,
  UpdateOrgModulesInput,
} from "../types/organizationModule";

const buildDefaultModulesMap = (): OrgModulesMap =>
  Object.fromEntries(
    ALL_ORG_MODULE_KEYS.map((key) => [key, true]),
  ) as OrgModulesMap;

export const organizationModuleService = {
  getEnabledModuleKeys: async (
    organizationId: string | null | undefined,
  ): Promise<OrgModuleKey[]> => {
    if (!organizationId) {
      return [];
    }

    const enabledKeys =
      await organizationModuleRepository.findEnabledByOrganizationId(
        organizationId,
      );

    return enabledKeys.map(fromDbModuleKey);
  },

  getModulesMap: async (organizationId: string): Promise<OrgModulesMap> => {
    const rows =
      await organizationModuleRepository.findByOrganizationId(organizationId);

    if (rows.length === 0) {
      return buildDefaultModulesMap();
    }

    return organizationModuleRepository.toModulesMap(rows);
  },

  getModulesResponse: async (
    organizationId: string,
  ): Promise<OrgModulesResponse> => ({
    modules: await organizationModuleService.getModulesMap(organizationId),
    catalog: ORG_MODULE_CATALOG,
  }),

  isModuleEnabled: async (
    organizationId: string,
    moduleKey: OrgModuleKey,
  ): Promise<boolean> => {
    return organizationModuleRepository.isModuleEnabled(
      organizationId,
      moduleKey,
    );
  },

  updateModules: async (
    organizationId: string,
    input: UpdateOrgModulesInput,
    auditContext?: AuditMutationContext,
  ): Promise<OrgModulesResponse> => {
    const updates = input.modules ?? {};
    const invalidKeys = Object.keys(updates).filter(
      (key) => !ALL_ORG_MODULE_KEYS.includes(key as OrgModuleKey),
    );

    if (invalidKeys.length > 0) {
      throw AppError.badRequest("Invalid module key", [
        {
          field: "modules",
          message: `Unknown module keys: ${invalidKeys.join(", ")}`,
        },
      ]);
    }

    if (Object.keys(updates).length === 0) {
      throw AppError.badRequest("At least one module must be provided", [
        { field: "modules", message: "No module updates provided" },
      ]);
    }

    const beforeModules = await organizationModuleService.getModulesMap(
      organizationId,
    );

    await organizationModuleRepository.upsertModules(organizationId, updates);

    const afterModules = await organizationModuleService.getModulesMap(
      organizationId,
    );

    if (auditContext) {
      auditService.log({
        organizationId,
        actorId: auditContext.authUser.id,
        action: "ORG_MODULES_UPDATED",
        entityType: "organization",
        entityId: organizationId,
        metadata: {
          summary: "Organization modules updated",
          actor: buildActorSnapshot(auditContext.authUser),
          before: { modules: beforeModules },
          after: { modules: afterModules },
          changedFields: ["modules"],
        },
        requestContext: auditContext.requestContext,
      });
    }

    return organizationModuleService.getModulesResponse(organizationId);
  },
};

export { ORG_MODULE_KEYS };
