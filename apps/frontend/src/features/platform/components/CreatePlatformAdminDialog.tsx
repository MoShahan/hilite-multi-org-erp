import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { useAppDispatch } from "@/app/hooks";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  DEFAULT_NEW_USER_PASSWORD,
  PASSWORD_HELPER_TEXT,
  passwordFieldSchema,
} from "@/lib/password";

import { createPlatformUser } from "../platformSlice";

type ApiRejection = {
  message: string;
  details?: { field?: string; message: string }[];
};

const isApiRejection = (value: unknown): value is ApiRejection => {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
};

const createPlatformAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordFieldSchema(),
});

type CreatePlatformAdminFormValues = z.infer<typeof createPlatformAdminSchema>;

const defaultValues: CreatePlatformAdminFormValues = {
  name: "",
  email: "",
  password: DEFAULT_NEW_USER_PASSWORD,
};

type CreatePlatformAdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export const CreatePlatformAdminDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreatePlatformAdminDialogProps) => {
  const dispatch = useAppDispatch();

  const form = useForm<CreatePlatformAdminFormValues>({
    resolver: zodResolver(createPlatformAdminSchema),
    mode: "onChange",
    defaultValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues);
    }

    onOpenChange(nextOpen);
  };

  const applyApiFieldErrors = (
    details?: { field?: string; message: string }[],
  ) => {
    details?.forEach((detail) => {
      if (!detail.field) {
        return;
      }

      const fieldMap: Record<string, keyof CreatePlatformAdminFormValues> = {
        name: "name",
        email: "email",
        password: "password",
      };

      const formField = fieldMap[detail.field];

      if (formField) {
        form.setError(formField, { message: detail.message });
      }
    });
  };

  const onSubmit = async (values: CreatePlatformAdminFormValues) => {
    try {
      await dispatch(
        createPlatformUser({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      ).unwrap();

      toast.success("Platform admin created");
      handleOpenChange(false);
      onCreated?.();
    } catch (error) {
      if (isApiRejection(error)) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
      } else {
        toast.error("Failed to create platform admin");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add platform admin</DialogTitle>
          <DialogDescription>
            Create a new platform administrator account with a default password.
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
                    <Input placeholder="Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@hilite.com"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      resetToken={open}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{PASSWORD_HELPER_TEXT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create admin"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
