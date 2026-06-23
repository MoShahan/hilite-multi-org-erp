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

import type { UserStatus } from "../usersTypes";

type UpdateUserStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentStatus: UserStatus;
  isSubmitting?: boolean;
  onConfirm: () => void;
};

export const UpdateUserStatusDialog = ({
  open,
  onOpenChange,
  userName,
  currentStatus,
  isSubmitting = false,
  onConfirm,
}: UpdateUserStatusDialogProps) => {
  const isDeactivating = currentStatus === "ACTIVE";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeactivating ? "Deactivate user?" : "Activate user?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDeactivating ? (
              <>
                <strong>{userName}</strong> will be unable to sign in until
                their account is activated again.
              </>
            ) : (
              <>
                <strong>{userName}</strong> will be able to sign in again.
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
              : isDeactivating
                ? "Deactivate"
                : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
