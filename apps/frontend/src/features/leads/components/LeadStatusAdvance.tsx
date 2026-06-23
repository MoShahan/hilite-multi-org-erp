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
        {allowedNext.map((nextStatus) => (
          <Button
            key={nextStatus}
            type="button"
            variant={nextStatus === "LOST" ? "outline" : "default"}
            disabled={disabled || isSubmitting}
            onClick={() => setPendingStatus(nextStatus)}
          >
            {getAdvanceActionLabel(nextStatus)}
          </Button>
        ))}
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
              className={
                pendingStatus === "LOST"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : undefined
              }
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
