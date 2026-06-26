import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { selectAuthUser } from "@/features/auth/authSelectors";
import { fetchMe } from "@/features/auth/authSlice";
import { ApiClientError } from "@/lib/api-client";

import { accountService } from "../accountService";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phoneNumber: z.string().refine((val) => val === "" || /^\d{10}$/.test(val), {
    message: "Phone number must be exactly 10 digits",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditProfileDialog = ({
  open,
  onOpenChange,
}: EditProfileDialogProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name,
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [open, user, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({
        name: user?.name ?? "",
        phoneNumber: user?.phoneNumber ?? "",
      });
    }

    onOpenChange(nextOpen);
  };

  const trimmedName = form.watch("name").trim();
  const trimmedPhone = form.watch("phoneNumber").trim();
  const currentPhone = user?.phoneNumber ?? "";
  const isUnchanged =
    trimmedName === (user?.name ?? "") &&
    trimmedPhone === currentPhone;
  const canSubmit =
    form.formState.isValid && !isUnchanged && !form.formState.isSubmitting;

  const applyApiFieldErrors = (
    details?: { field?: string; message: string }[],
  ) => {
    const fieldMap: Partial<Record<string, keyof ProfileFormValues>> = {
      name: "name",
      phoneNumber: "phoneNumber",
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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await accountService.updateProfile({
        name: values.name.trim(),
        phoneNumber: values.phoneNumber.trim() || null,
      });
      await dispatch(fetchMe()).unwrap();
      toast.success("Profile updated");
      handleOpenChange(false);
    } catch (error) {
      if (error instanceof ApiClientError) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
        return;
      }

      toast.error("Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name and phone number.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="9876543210"
                      inputMode="numeric"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {form.formState.isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
