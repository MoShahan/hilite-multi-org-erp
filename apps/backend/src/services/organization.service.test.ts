import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/organization.repository", () => ({
  organizationRepository: {
    findManyPaginated: vi.fn(),
    findManyOptions: vi.fn(),
    findById: vi.fn(),
    findByCode: vi.fn(),
    createWithOrgAdmin: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("../repositories/user.repository", () => ({
  authUserRepository: {
    emailExists: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

vi.mock("./welcomeNotification.service", () => ({
  welcomeNotificationService: {
    notifyNewUser: vi.fn(),
  },
}));

import { organizationRepository } from "../repositories/organization.repository";
import { organizationService } from "./organization.service";

describe("organizationService.listOrganizationOptions", () => {
  beforeEach(() => {
    vi.mocked(organizationRepository.findManyOptions).mockReset();
    vi.mocked(organizationRepository.findManyOptions).mockResolvedValue([]);
  });

  it("returns organization options", async () => {
    vi.mocked(organizationRepository.findManyOptions).mockResolvedValue([
      { id: "org-1", name: "Acme", code: "acme" },
    ]);

    const result = await organizationService.listOrganizationOptions({});

    expect(result.organizations).toEqual([
      { id: "org-1", name: "Acme", code: "acme" },
    ]);
  });
});
