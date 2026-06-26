import { LeadStatus } from "../generated/prisma/client";
import { describe, expect, it } from "vitest";

import type { AuditLogRecord } from "../repositories/audit.repository";
import { buildLeadStatusHistory } from "./leadStatusHistory";

const lead = {
  id: "lead-1",
  createdBy: { id: "user-1", name: "Alice" },
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
};

const baseAuditFields = {
  organizationId: "org-1",
  entityType: "lead",
  entityId: "lead-1",
  organization: null,
};

const makeAuditLog = (
  overrides: Partial<AuditLogRecord> & Pick<AuditLogRecord, "id" | "action" | "createdAt">,
): AuditLogRecord =>
  ({
    actorId: "user-2",
    actor: { id: "user-2", name: "Bob", email: "bob@test.com", userRole: null },
    metadata: {},
    ...baseAuditFields,
    ...overrides,
  }) as AuditLogRecord;

describe("buildLeadStatusHistory", () => {
  it("uses LEAD_CREATED audit for the created entry", () => {
    const auditLogs = [
      makeAuditLog({
        id: "audit-created",
        action: "LEAD_CREATED",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        metadata: {
          summary: "Lead created",
          after: { status: LeadStatus.NEW },
        },
      }),
    ];

    const result = buildLeadStatusHistory(lead, auditLogs);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toEqual({
      kind: "created",
      id: "audit-created",
      toStatus: LeadStatus.NEW,
      changedBy: { id: "user-2", name: "Bob" },
      changedAt: "2026-01-01T10:00:00.000Z",
    });
  });

  it("falls back to lead createdBy when no LEAD_CREATED audit exists", () => {
    const result = buildLeadStatusHistory(lead, []);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toEqual({
      kind: "created",
      id: "created-lead-1",
      toStatus: LeadStatus.NEW,
      changedBy: { id: "user-1", name: "Alice" },
      changedAt: "2026-01-01T10:00:00.000Z",
    });
  });

  it("maps transitions and sorts newest first", () => {
    const auditLogs = [
      makeAuditLog({
        id: "audit-created",
        action: "LEAD_CREATED",
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
        metadata: { after: { status: LeadStatus.NEW } },
      }),
      makeAuditLog({
        id: "audit-t1",
        action: "LEAD_STATUS_CHANGED",
        createdAt: new Date("2026-01-02T10:00:00.000Z"),
        metadata: {
          before: { status: LeadStatus.NEW },
          after: { status: LeadStatus.CONTACTED },
        },
      }),
      makeAuditLog({
        id: "audit-t2",
        action: "LEAD_STATUS_CHANGED",
        createdAt: new Date("2026-01-03T10:00:00.000Z"),
        metadata: {
          before: { status: LeadStatus.CONTACTED },
          after: { status: LeadStatus.VISIT_SCHEDULED },
        },
      }),
    ];

    const result = buildLeadStatusHistory(lead, auditLogs);

    expect(result.entries).toHaveLength(3);
    expect(result.entries[0]?.kind).toBe("transition");
    expect(result.entries[0]).toMatchObject({
      id: "audit-t2",
      fromStatus: LeadStatus.CONTACTED,
      toStatus: LeadStatus.VISIT_SCHEDULED,
    });
    expect(result.entries[1]).toMatchObject({ id: "audit-t1" });
    expect(result.entries[2]).toMatchObject({ kind: "created", id: "audit-created" });
  });

  it("skips malformed transition audit rows", () => {
    const auditLogs = [
      makeAuditLog({
        id: "audit-bad",
        action: "LEAD_STATUS_CHANGED",
        createdAt: new Date("2026-01-02T10:00:00.000Z"),
        metadata: { before: { status: "INVALID" }, after: { status: LeadStatus.WON } },
      }),
    ];

    const result = buildLeadStatusHistory(lead, auditLogs);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.kind).toBe("created");
  });
});
