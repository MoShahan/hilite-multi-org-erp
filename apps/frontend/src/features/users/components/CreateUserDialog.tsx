import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { rolesService } from "@/features/roles/rolesService";
import {
  DEFAULT_NEW_USER_PASSWORD,
  PASSWORD_HELPER_TEXT,
  passwordFieldSchema,
} from "@/lib/password";

import { createUser } from "../usersSlice";

import type { OrganizationRoleOption } from "../usersTypes";

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

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: passwordFieldSchema(),
  roleId: z.string().min(1, "Role is required"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const defaultValues: CreateUserFormValues = {
  name: "",
  email: "",
  password: DEFAULT_NEW_USER_PASSWORD,
  roleId: "",
};

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export const CreateUserDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateUserDialogProps) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<OrganizationRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);

      try {
        const organizationRoles = await rolesService.listRoles({
          assignableFrom: "users",
        });

        if (!cancelled) {
          setRoles(
            organizationRoles.map((role) => ({
              id: role.id,
              name: role.name,
              slug: role.slug,
            })),
          );
        }
      } catch {
        if (!cancelled) {
          setRolesError("Failed to load roles");
        }
      } finally {
        if (!cancelled) {
          setRolesLoading(false);
        }
      }
    };

    void loadRoles();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues);
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

      const fieldMap: Record<string, keyof CreateUserFormValues> = {
        name: "name",
        email: "email",
        password: "password",
        roleId: "roleId",
      };

      const formField = fieldMap[detail.field];

      if (formField) {
        form.setError(formField, { message: detail.message });
      }
    });
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    setIsSubmitting(true);

    try {
      await dispatch(
        createUser({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          roleId: values.roleId,
        }),
      ).unwrap();

      toast.success("User created");
      handleOpenChange(false);
      onCreated?.();
    } catch (error) {
      if (isApiRejection(error)) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create a new organization-wide user and assign a role.
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
                      placeholder="jane@company.com"
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>{PASSWORD_HELPER_TEXT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  {rolesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : rolesError ? (
                    <p className="text-sm text-destructive">{rolesError}</p>
                  ) : (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={roles.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                            <span className="ml-1 text-muted-foreground">
                              ({role.slug})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rolesLoading || !!rolesError}
              >
                {isSubmitting ? "Creating..." : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
