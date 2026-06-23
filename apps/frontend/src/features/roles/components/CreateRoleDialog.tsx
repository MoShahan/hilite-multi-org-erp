import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ApiClientError } from "@/lib/api-client";

import { PermissionToggleRow } from "./PermissionToggleRow";
import {
  filterPermissionsForCreateRole,
  isTeamGrantPermission,
} from "../permissionScopeUtils";
import { rolesService } from "../rolesService";

import type {
  MembershipScope,
  PermissionCatalogItem,
  Role,
} from "../rolesTypes";

const slugPattern = /^[a-z0-9_]+$/;

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  slug: z
    .string()
    .min(1, "Role slug is required")
    .regex(
      slugPattern,
      "Slug must contain only lowercase letters, numbers, and underscores",
    ),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

type CreateRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: PermissionCatalogItem[];
  onCreated: (role: Role) => void;
};

export const CreateRoleDialog = ({
  open,
  onOpenChange,
  permissions,
  onCreated,
}: CreateRoleDialogProps) => {
  const [membershipScope, setMembershipScope] =
    useState<MembershipScope>("organization");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const watchedName = form.watch("name");

  const slugPreview = useMemo(() => {
    if (slugTouched) {
      return form.getValues("slug");
    }

    return toSlug(watchedName);
  }, [form, slugTouched, watchedName]);

  const visiblePermissions = useMemo(
    () => filterPermissionsForCreateRole(permissions, membershipScope),
    [membershipScope, permissions],
  );

  const resetForm = () => {
    form.reset({ name: "", slug: "" });
    setMembershipScope("organization");
    setSelectedPermissions([]);
    setSlugTouched(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const handleMembershipScopeChange = (nextScope: MembershipScope) => {
    setMembershipScope(nextScope);

    if (nextScope === "team") {
      setSelectedPermissions((current) =>
        current.filter((key) => {
          const permission = permissions.find((entry) => entry.key === key);
          return permission?.grantScope !== "org_wide";
        }),
      );
    }
  };

  const togglePermission = (permissionKey: string, enabled: boolean) => {
    setSelectedPermissions((current) => {
      if (enabled) {
        return current.includes(permissionKey)
          ? current
          : [...current, permissionKey];
      }

      return current.filter((key) => key !== permissionKey);
    });
  };

  const onSubmit = async (values: CreateRoleFormValues) => {
    setIsSubmitting(true);

    try {
      const role = await rolesService.createRole({
        name: values.name.trim(),
        slug: values.slug.trim(),
        membershipScope,
        permissions: selectedPermissions,
      });

      toast.success("Role created");
      onCreated(role);
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create role",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Define a custom role and choose which permissions it includes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Role type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["organization", "team"] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => handleMembershipScopeChange(scope)}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left transition-colors",
                        membershipScope === scope
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-medium capitalize">{scope}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {scope === "organization"
                          ? "Assigned from the Users page. Team membership is optional."
                          : "Assigned from a team page. User must belong to a team."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Senior Closer"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);

                          if (!slugTouched) {
                            form.setValue("slug", toSlug(event.target.value), {
                              shouldValidate: true,
                            });
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="senior_closer"
                        {...field}
                        value={slugTouched ? field.value : slugPreview}
                        onChange={(event) => {
                          setSlugTouched(true);
                          field.onChange(toSlug(event.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">Permissions</p>
                <div className="space-y-2">
                  {visiblePermissions.map((permission) => (
                    <PermissionToggleRow
                      key={permission.key}
                      label={permission.label}
                      description={permission.description}
                      checked={selectedPermissions.includes(permission.key)}
                      disabled={isSubmitting}
                      badge={
                        isTeamGrantPermission(permission)
                          ? "Requires team membership"
                          : undefined
                      }
                      onCheckedChange={(checked) =>
                        togglePermission(permission.key, checked)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
