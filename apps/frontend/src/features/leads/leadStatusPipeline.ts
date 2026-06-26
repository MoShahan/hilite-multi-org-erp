import type { LeadStatus } from "@hilite/shared";
import {
  getAllowedNextStatuses,
  getLinearStageIndex,
  isTerminalLeadStatus,
  LEAD_STATUS_LABELS,
  LINEAR_LEAD_STAGES,
  TERMINAL_LEAD_STAGES,
} from "@hilite/shared";

export {
  getAllowedNextStatuses,
  getLinearStageIndex,
  isTerminalLeadStatus,
  LEAD_STATUS_LABELS,
  LINEAR_LEAD_STAGES,
  TERMINAL_LEAD_STAGES,
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
