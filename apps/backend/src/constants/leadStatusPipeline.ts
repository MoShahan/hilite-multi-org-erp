import { LeadStatus } from "../generated/prisma/client";
import {
  getAllowedNextStatuses as getSharedAllowedNextStatuses,
  LEAD_STATUS_LABELS,
  LINEAR_LEAD_STAGES,
  TERMINAL_LEAD_STAGES,
} from "@hilite/shared";
import { AppError } from "../utils/AppError";

export {
  LEAD_STATUS_LABELS,
  LINEAR_LEAD_STAGES,
  TERMINAL_LEAD_STAGES,
};

export const getAllowedNextStatuses = (current: LeadStatus): LeadStatus[] =>
  getSharedAllowedNextStatuses(current) as LeadStatus[];

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
