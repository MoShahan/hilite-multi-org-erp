import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api-client";
import { PASSWORD_HELPER_TEXT, passwordFieldSchema } from "@/lib/password";

import { accountService } from "../accountService";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordFieldSchema(),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const defaultValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, form]);

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting;

  const applyApiFieldErrors = (
    details?: { field?: string; message: string }[],
  ) => {
    const fieldMap: Partial<
      Record<string, keyof ChangePasswordFormValues>
    > = {
      currentPassword: "currentPassword",
      newPassword: "newPassword",
    };

    details?.forEach((detail) => {
      if (!detail.field) {
        return;
      }

      const formField = fieldMap[detail.field];

      if (formField) {
        form.setError(formField, { message: detail.message });
      }
    });
  };

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await accountService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset(defaultValues);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      toast.success("Password updated");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiClientError) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
        return;
      }

      toast.error("Failed to change password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one. {PASSWORD_HELPER_TEXT}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrent((value) => !value)}
                        aria-label={
                          showCurrent ? "Hide password" : "Show password"
                        }
                      >
                        {showCurrent ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNew((value) => !value)}
                        aria-label={
                          showNew ? "Hide password" : "Show password"
                        }
                      >
                        {showNew ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>{PASSWORD_HELPER_TEXT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm((value) => !value)}
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {form.formState.isSubmitting ? "Updating..." : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
