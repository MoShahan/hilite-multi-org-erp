import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { LEAD_STATUS_BADGE_STYLES } from "./LeadStatusBadge";
import {
  getLinearStageIndex,
  isTerminalLeadStatus,
  LEAD_STATUS_LABELS,
  LINEAR_LEAD_STAGES,
} from "../leadStatusPipeline";

import type { LeadStatus } from "../leadsTypes";

type LeadStatusStepperProps = {
  status: LeadStatus;
};

export const LeadStatusStepper = ({ status }: LeadStatusStepperProps) => {
  const currentIndex = getLinearStageIndex(status);
  const isTerminal = isTerminalLeadStatus(status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {LINEAR_LEAD_STAGES.map((stage, index) => {
          const isCompleted = !isTerminal && currentIndex > index;
          const isCurrent = status === stage;

          return (
            <div key={stage} className="flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  isCurrent && LEAD_STATUS_BADGE_STYLES[stage],
                  isCompleted &&
                    "border-muted-foreground/20 bg-muted text-muted-foreground",
                  !isCurrent &&
                    !isCompleted &&
                    "border-dashed border-muted-foreground/25 text-muted-foreground/60",
                )}
              >
                {isCompleted ? <Check className="size-3" /> : null}
                {LEAD_STATUS_LABELS[stage]}
              </div>
              {index < LINEAR_LEAD_STAGES.length - 1 ? (
                <span className="text-muted-foreground/40">→</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
