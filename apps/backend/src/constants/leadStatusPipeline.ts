import { LeadStatus } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";

export const LINEAR_LEAD_STAGES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.VISIT_SCHEDULED,
  LeadStatus.SITE_VISIT_COMPLETED,
  LeadStatus.NEGOTIATION,
] as const;

export const TERMINAL_LEAD_STAGES = [LeadStatus.WON, LeadStatus.LOST] as const;

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "New",
  [LeadStatus.CONTACTED]: "Contacted",
  [LeadStatus.VISIT_SCHEDULED]: "Visit scheduled",
  [LeadStatus.SITE_VISIT_COMPLETED]: "Site visit completed",
  [LeadStatus.NEGOTIATION]: "Negotiation",
  [LeadStatus.WON]: "Won",
  [LeadStatus.LOST]: "Lost",
};

const isTerminalStatus = (status: LeadStatus) =>
  TERMINAL_LEAD_STAGES.includes(status as (typeof TERMINAL_LEAD_STAGES)[number]);

export const getAllowedNextStatuses = (current: LeadStatus): LeadStatus[] => {
  if (isTerminalStatus(current)) {
    return [];
  }

  if (current === LeadStatus.NEGOTIATION) {
    return [LeadStatus.WON, LeadStatus.LOST];
  }

  const index = LINEAR_LEAD_STAGES.indexOf(
    current as (typeof LINEAR_LEAD_STAGES)[number],
  );

  if (index === -1) {
    return [];
  }

  return [LINEAR_LEAD_STAGES[index + 1]];
};

export const assertValidStatusTransition = (
  from: LeadStatus,
  to: LeadStatus,
) => {
  if (from === to) {
    return;
  }

  const allowed = getAllowedNextStatuses(from);

  if (!allowed.includes(to)) {
    throw AppError.badRequest(
      `Invalid status transition from ${LEAD_STATUS_LABELS[from]} to ${LEAD_STATUS_LABELS[to]}`,
      [
        {
          field: "status",
          message: `Cannot move from ${LEAD_STATUS_LABELS[from]} to ${LEAD_STATUS_LABELS[to]}`,
        },
      ],
    );
  }
};
