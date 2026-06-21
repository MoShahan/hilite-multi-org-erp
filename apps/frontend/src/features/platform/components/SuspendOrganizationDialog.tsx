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

import type { OrganizationStatus } from "../platformTypes";

type SuspendOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  currentStatus: OrganizationStatus;
  isSubmitting?: boolean;
  onConfirm: () => void;
};

export const SuspendOrganizationDialog = ({
  open,
  onOpenChange,
  organizationName,
  currentStatus,
  isSubmitting = false,
  onConfirm,
}: SuspendOrganizationDialogProps) => {
  const isSuspending = currentStatus === "ACTIVE";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSuspending ? "Suspend organization?" : "Activate organization?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSuspending ? (
              <>
                Users in <strong>{organizationName}</strong> will be unable to
                sign in until the organization is activated again.
              </>
            ) : (
              <>
                Users in <strong>{organizationName}</strong> will be able to
                sign in again.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isSubmitting
              ? "Saving..."
              : isSuspending
                ? "Suspend"
                : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
