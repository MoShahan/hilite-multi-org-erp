import { LeadStatus } from "../generated/prisma/client";
import type { AuditLogRecord } from "../repositories/audit.repository";
import type { AuditMetadata } from "../types/audit";
import type {
  LeadStatusHistoryActor,
  LeadStatusHistoryEntry,
  LeadStatusHistoryResponse,
  LeadStatusHistoryTransitionEntry,
} from "../types/lead";

type LeadCreatedBy = {
  id: string;
  name: string;
};

type LeadForStatusHistory = {
  id: string;
  createdBy: LeadCreatedBy;
  createdAt: Date;
};

const LEAD_STATUS_VALUES = new Set<string>(Object.values(LeadStatus));

const isLeadStatus = (value: unknown): value is LeadStatus =>
  typeof value === "string" && LEAD_STATUS_VALUES.has(value);

const resolveActor = (
  record: AuditLogRecord,
  metadata: AuditMetadata,
): LeadStatusHistoryActor | null => {
  if (record.actor) {
    return { id: record.actor.id, name: record.actor.name };
  }

  if (metadata.actor) {
    return { id: metadata.actor.id, name: metadata.actor.name };
  }

  return null;
};

const buildCreatedEntry = (
  lead: LeadForStatusHistory,
  createdAudit: AuditLogRecord | undefined,
): LeadStatusHistoryEntry => {
  if (createdAudit) {
    const metadata = (createdAudit.metadata ?? {}) as AuditMetadata;
    const afterStatus = metadata.after?.status;
    const actor = resolveActor(createdAudit, metadata);

    return {
      kind: "created",
      id: createdAudit.id,
      toStatus: isLeadStatus(afterStatus) ? afterStatus : LeadStatus.NEW,
      changedBy: actor ?? {
        id: lead.createdBy.id,
        name: lead.createdBy.name,
      },
      changedAt: createdAudit.createdAt.toISOString(),
    };
  }

  return {
    kind: "created",
    id: `created-${lead.id}`,
    toStatus: LeadStatus.NEW,
    changedBy: {
      id: lead.createdBy.id,
      name: lead.createdBy.name,
    },
    changedAt: lead.createdAt.toISOString(),
  };
};

const mapTransitionEntry = (
  record: AuditLogRecord,
): LeadStatusHistoryTransitionEntry | null => {
  const metadata = (record.metadata ?? {}) as AuditMetadata;
  const fromStatus = metadata.before?.status;
  const toStatus = metadata.after?.status;

  if (!isLeadStatus(fromStatus) || !isLeadStatus(toStatus)) {
    return null;
  }

  return {
    kind: "transition",
    id: record.id,
    fromStatus,
    toStatus,
    changedBy: resolveActor(record, metadata),
    changedAt: record.createdAt.toISOString(),
  };
};

export const buildLeadStatusHistory = (
  lead: LeadForStatusHistory,
  auditLogs: AuditLogRecord[],
): LeadStatusHistoryResponse => {
  const createdAudit = auditLogs.find((log) => log.action === "LEAD_CREATED");
  const createdEntry = buildCreatedEntry(lead, createdAudit);

  const transitions = auditLogs
    .filter((log) => log.action === "LEAD_STATUS_CHANGED")
    .map(mapTransitionEntry)
    .filter((entry): entry is LeadStatusHistoryTransitionEntry => entry !== null);

  const entries: LeadStatusHistoryEntry[] = [createdEntry, ...transitions].sort(
    (a, b) =>
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return { entries };
};
