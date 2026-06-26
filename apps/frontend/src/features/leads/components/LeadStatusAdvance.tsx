import { useState } from "react";
import { toast } from "sonner";

import { useAppDispatch } from "@/app/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { updateLead } from "../leadsSlice";
import {
  getAdvanceActionLabel,
  getAllowedNextStatuses,
  isTerminalLeadStatus,
  LEAD_STATUS_LABELS,
} from "../leadStatusPipeline";

import type { Lead, LeadStatus } from "../leadsTypes";

type ApiRejection = {
  message: string;
  details?: { field?: string; message: string }[];
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

type LeadStatusAdvanceProps = {
  lead: Lead;
  disabled?: boolean;
  onAdvanced?: () => void;
};

const ADVANCE_BUTTON_STYLES: Partial<
  Record<LeadStatus, { variant: "default" | "outline"; className: string }>
> = {
  WON: {
    variant: "default",
    className:
      "border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700 focus-visible:ring-emerald-500/40 dark:border-emerald-600 dark:bg-emerald-600 dark:hover:border-emerald-500 dark:hover:bg-emerald-500",
  },
  LOST: {
    variant: "outline",
    className:
      "border-rose-300 bg-background text-rose-700 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-rose-500/40 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-200",
  },
};

const CONFIRM_ACTION_STYLES: Partial<Record<LeadStatus, string>> = {
  WON: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  LOST: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500",
};

export const LeadStatusAdvance = ({
  lead,
  disabled = false,
  onAdvanced,
}: LeadStatusAdvanceProps) => {
  const dispatch = useAppDispatch();
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedNext = getAllowedNextStatuses(lead.status);
  const isTerminal = isTerminalLeadStatus(lead.status);
  const isStuck = !isTerminal && allowedNext.length === 0;

  const handleConfirm = async () => {
    if (!pendingStatus) return;

    setIsSubmitting(true);

    try {
      await dispatch(
        updateLead({
          leadId: lead.id,
          input: { status: pendingStatus },
        }),
      ).unwrap();

      toast.success("Lead status updated");
      setPendingStatus(null);
      onAdvanced?.();
    } catch (error) {
      if (isApiRejection(error)) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update lead status");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTerminal) {
    return (
      <p className="text-sm text-muted-foreground">This lead is closed.</p>
    );
  }

  if (isStuck) {
    return (
      <p className="text-sm text-muted-foreground">
        Status can&apos;t be advanced. Contact your administrator.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allowedNext.map((nextStatus) => {
          const buttonStyles = ADVANCE_BUTTON_STYLES[nextStatus];

          return (
            <Button
              key={nextStatus}
              type="button"
              variant={buttonStyles?.variant ?? "default"}
              className={buttonStyles?.className}
              disabled={disabled || isSubmitting}
              onClick={() => setPendingStatus(nextStatus)}
            >
              {getAdvanceActionLabel(nextStatus)}
            </Button>
          );
        })}
      </div>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setPendingStatus(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advance lead status?</AlertDialogTitle>
            <AlertDialogDescription>
              Move <strong>{lead.name}</strong> from{" "}
              <strong>{LEAD_STATUS_LABELS[lead.status]}</strong> to{" "}
              <strong>
                {pendingStatus ? LEAD_STATUS_LABELS[pendingStatus] : ""}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              className={cn(
                pendingStatus ? CONFIRM_ACTION_STYLES[pendingStatus] : undefined,
              )}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
