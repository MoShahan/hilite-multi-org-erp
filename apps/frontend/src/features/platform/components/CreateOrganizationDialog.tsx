import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_NEW_USER_PASSWORD,
  PASSWORD_HELPER_TEXT,
  passwordFieldSchema,
} from "@/lib/password";

import { createOrganization } from "../platformSlice";

const codePattern = /^[a-z0-9-]+$/;

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

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  code: z
    .string()
    .min(1, "Organization code is required")
    .regex(
      codePattern,
      "Code must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  orgAdminName: z.string().min(1, "Org admin name is required"),
  orgAdminEmail: z.email("Enter a valid email address"),
  orgAdminPassword: passwordFieldSchema(),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

const defaultValues: CreateOrganizationFormValues = {
  name: "",
  code: "",
  description: "",
  logoUrl: "",
  orgAdminName: "",
  orgAdminEmail: "",
  orgAdminPassword: DEFAULT_NEW_USER_PASSWORD,
};

const slugifyName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export const CreateOrganizationDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateOrganizationDialogProps) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onChange",
    defaultValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues);
      setCodeTouched(false);
      setShowPassword(false);
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

      const fieldMap: Record<string, keyof CreateOrganizationFormValues> = {
        name: "name",
        code: "code",
        description: "description",
        logoUrl: "logoUrl",
        "orgAdmin.name": "orgAdminName",
        "orgAdmin.email": "orgAdminEmail",
        "orgAdmin.password": "orgAdminPassword",
      };

      const formField = fieldMap[detail.field];

      if (formField) {
        form.setError(formField, { message: detail.message });
      }
    });
  };

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    setIsSubmitting(true);

    try {
      await dispatch(
        createOrganization({
          name: values.name.trim(),
          code: values.code.trim().toLowerCase(),
          description: values.description?.trim() || undefined,
          logoUrl: values.logoUrl?.trim() || undefined,
          orgAdmin: {
            name: values.orgAdminName.trim(),
            email: values.orgAdminEmail.trim().toLowerCase(),
            password: values.orgAdminPassword,
          },
        }),
      ).unwrap();

      toast.success("Organization created");
      handleOpenChange(false);
      onCreated?.();
    } catch (error) {
      if (isApiRejection(error)) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
      } else {
        toast.error("Failed to create organization");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Add a new tenant and its first organization admin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Organization</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Builders"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);

                          if (!codeTouched) {
                            form.setValue(
                              "code",
                              slugifyName(event.target.value),
                              { shouldValidate: true },
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="acme-builders"
                        {...field}
                        onChange={(event) => {
                          setCodeTouched(true);
                          field.onChange(event.target.value.toLowerCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Org admin</h3>
              <FormField
                control={form.control}
                name="orgAdminName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orgAdminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@acme.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orgAdminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute top-1/2 right-1 -translate-y-1/2"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>{PASSWORD_HELPER_TEXT}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create organization"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
