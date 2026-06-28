export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "SITE_VISIT_COMPLETED"
  | "VISIT_SCHEDULED";

export const LINEAR_LEAD_STAGES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "SITE_VISIT_COMPLETED",
  "NEGOTIATION",
];

export const TERMINAL_LEAD_STAGES: LeadStatus[] = ["WON", "LOST"];

export const LEAD_STATUS_SORT_ORDER: LeadStatus[] = [
  ...LINEAR_LEAD_STAGES,
  ...TERMINAL_LEAD_STAGES,
];

export const getLeadStatusSortIndex = (status: LeadStatus): number =>
  LEAD_STATUS_SORT_ORDER.indexOf(status);

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit scheduled",
  SITE_VISIT_COMPLETED: "Site visit completed",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

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
