import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/organizationModule.repository", () => ({
  organizationModuleRepository: {
    findEnabledByOrganizationId: vi.fn(),
    findByOrganizationId: vi.fn(),
    toModulesMap: vi.fn(),
    isModuleEnabled: vi.fn(),
    upsertModules: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { organizationModuleRepository } from "../repositories/organizationModule.repository";
import { organizationModuleService } from "./organizationModule.service";
import { expectAppErrorAsync } from "../test/helpers";

const orgId = "org-1";

describe("organizationModuleService.getEnabledModuleKeys", () => {
  beforeEach(() => {
    vi.mocked(
      organizationModuleRepository.findEnabledByOrganizationId,
    ).mockReset();
  });

  it("returns empty list for missing organization id", async () => {
    await expect(organizationModuleService.getEnabledModuleKeys(null)).resolves.toEqual(
      [],
    );
  });

  it("maps enabled repository keys", async () => {
    vi.mocked(
      organizationModuleRepository.findEnabledByOrganizationId,
    ).mockResolvedValue(["SALES_ERP"] as never);

    await expect(
      organizationModuleService.getEnabledModuleKeys(orgId),
    ).resolves.toEqual([ORG_MODULE_KEYS.SALES_ERP]);
  });
});

describe("organizationModuleService.updateModules", () => {
  beforeEach(() => {
    vi.mocked(organizationModuleRepository.findByOrganizationId).mockReset();
    vi.mocked(organizationModuleRepository.toModulesMap).mockReset();
    vi.mocked(organizationModuleRepository.upsertModules).mockReset();
  });

  it("rejects invalid module keys", async () => {
    await expectAppErrorAsync(
      () =>
        organizationModuleService.updateModules(orgId, {
          modules: { invalid_module: false },
        }),
      400,
      "BAD_REQUEST",
    );
  });

  it("requires at least one module update", async () => {
    await expectAppErrorAsync(
      () => organizationModuleService.updateModules(orgId, { modules: {} }),
      400,
      "BAD_REQUEST",
    );
  });
});
