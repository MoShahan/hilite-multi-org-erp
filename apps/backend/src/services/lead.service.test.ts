import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {},
}));

vi.mock("../repositories/lead.repository", () => ({
  leadRepository: {
    findManyPaginated: vi.fn(),
    findByIdForOrganization: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    assign: vi.fn(),
    listStatusHistory: vi.fn(),
  },
}));

vi.mock("../repositories/audit.repository", () => ({
  auditRepository: {
    findByEntity: vi.fn(),
  },
}));

vi.mock("../lib/eventBus", () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

import { LeadStatus } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { leadRepository } from "../repositories/lead.repository";
import { leadService } from "./lead.service";
import { baseAuthUser, expectAppErrorAsync } from "../test/helpers";

const orgId = "org-1";

const leadRecord = {
  id: "lead-1",
  organizationId: orgId,
  teamId: "team-a",
  assignedToId: "user-1",
  status: LeadStatus.NEGOTIATION,
  name: "Acme",
  mobileNumber: "+15551234567",
  email: null,
  source: null,
  project: null,
  team: { id: "team-a", name: "Team A" },
  assignedTo: { id: "user-1", name: "Test User", email: "user@example.com" },
  createdBy: { id: "user-1", name: "Test User", email: "user@example.com" },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("leadService.listLeads", () => {
  beforeEach(() => {
    vi.mocked(leadRepository.findManyPaginated).mockReset();
    vi.mocked(leadRepository.findManyPaginated).mockResolvedValue({
      leads: [],
      total: 0,
    });
  });

  it("requires organization context", async () => {
    await expectAppErrorAsync(
      () => leadService.listLeads(null, baseAuthUser(), {}),
      403,
      "FORBIDDEN",
    );
  });

  it("returns paginated leads for authorized users", async () => {
    const result = await leadService.listLeads(
      orgId,
      baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_ORG] }),
      {},
    );

    expect(result.leads).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});

describe("leadService.getLead", () => {
  beforeEach(() => {
    vi.mocked(leadRepository.findByIdForOrganization).mockReset();
  });

  it("returns not found for missing lead", async () => {
    vi.mocked(leadRepository.findByIdForOrganization).mockResolvedValue(null);

    await expectAppErrorAsync(
      () =>
        leadService.getLead(
          orgId,
          baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_ORG] }),
          "missing-lead",
        ),
      404,
      "NOT_FOUND",
    );
  });

  it("returns lead when caller can read it", async () => {
    vi.mocked(leadRepository.findByIdForOrganization).mockResolvedValue(
      leadRecord as never,
    );

    const result = await leadService.getLead(
      orgId,
      baseAuthUser({ permissions: [PERMISSIONS.LEADS_READ_ORG] }),
      "lead-1",
    );

    expect(result.name).toBe("Acme");
  });
});

describe("leadService.createLead", () => {
  it("requires organization context", async () => {
    await expectAppErrorAsync(
      () =>
        leadService.createLead(
          null,
          baseAuthUser({ permissions: [PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_ORG] }),
          {
            name: "Acme",
            mobileNumber: "+15551234567",
            teamId: "team-a",
          },
        ),
      403,
      "FORBIDDEN",
    );
  });
});
