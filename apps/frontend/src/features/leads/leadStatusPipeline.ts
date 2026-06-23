import type { LeadStatus } from "./leadsTypes";

export const LINEAR_LEAD_STAGES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
];

export const TERMINAL_LEAD_STAGES: LeadStatus[] = ["WON", "LOST"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit scheduled",
  SITE_VISIT_COMPLETED: "Site visit completed",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const LEAD_STATUS_FILTER_OPTIONS: { value: LeadStatus; label: string }[] =
  [
    ...LINEAR_LEAD_STAGES.map((value) => ({
      value,
      label: LEAD_STATUS_LABELS[value],
    })),
    ...TERMINAL_LEAD_STAGES.map((value) => ({
      value,
      label: LEAD_STATUS_LABELS[value],
    })),
  ];

const ADVANCE_ACTION_LABELS: Partial<Record<LeadStatus, string>> = {
  CONTACTED: "Mark as contacted",
  VISIT_SCHEDULED: "Schedule site visit",
  SITE_VISIT_COMPLETED: "Mark site visit completed",
  NEGOTIATION: "Move to negotiation",
  WON: "Mark as won",
  LOST: "Mark as lost",
};

export const getAdvanceActionLabel = (nextStatus: LeadStatus): string =>
  ADVANCE_ACTION_LABELS[nextStatus] ?? `Move to ${LEAD_STATUS_LABELS[nextStatus]}`;

const isTerminalStatus = (status: LeadStatus) =>
  TERMINAL_LEAD_STAGES.includes(status);

export const getAllowedNextStatuses = (current: LeadStatus): LeadStatus[] => {
  if (isTerminalStatus(current)) {
    return [];
  }

  if (current === "NEGOTIATION") {
    return ["WON", "LOST"];
  }

  const index = LINEAR_LEAD_STAGES.indexOf(current);

  if (index === -1) {
    return [];
  }

  return [LINEAR_LEAD_STAGES[index + 1]];
};

export const isTerminalLeadStatus = (status: LeadStatus) =>
  isTerminalStatus(status);

export const getLinearStageIndex = (status: LeadStatus): number =>
  LINEAR_LEAD_STAGES.indexOf(status);
