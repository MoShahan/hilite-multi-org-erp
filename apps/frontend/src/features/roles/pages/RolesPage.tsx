import { Plus, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { selectHasPermission } from "@/features/auth/authSelectors";
import { ApiClientError } from "@/lib/api-client";

import { CreateRoleDialog } from "../components/CreateRoleDialog";
import { DeleteRoleDialog } from "../components/DeleteRoleDialog";
import { RoleListPanel } from "../components/RoleListPanel";
import {
  RolePermissionsPanel,
  RolePermissionsPanelSkeleton,
} from "../components/RolePermissionsPanel";
import { useRolesPage } from "../hooks/useRolesPage";
import { rolesService } from "../rolesService";

export const RolesPage = () => {
  const canWrite = useAppSelector(selectHasPermission("roles:write"));
  const canReadAllRoles = useAppSelector(selectHasPermission("roles:read"));
  const {
    roles,
    permissions,
    selectedRole,
    selectedRoleId,
    draftPermissions,
    status,
    error,
    isDirty,
    isSaving,
    load,
    selectRole,
    togglePermission,
    discardChanges,
    saveChanges,
    addRole,
    removeRole,
  } = useRolesPage();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = status === "idle" || status === "loading";

  const handleSave = async () => {
    try {
      await saveChanges();
      toast.success("Role permissions updated");
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiClientError
          ? saveError.message
          : "Failed to save role",
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) {
      return;
    }

    setIsDeleting(true);

    try {
      await rolesService.deleteRole(selectedRole.id);
      removeRole(selectedRole.id);
      setDeleteDialogOpen(false);
      toast.success("Role deleted");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiClientError
          ? deleteError.message
          : "Failed to delete role",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Roles & permissions
            </h1>
            <p className="text-sm text-muted-foreground">
              {canReadAllRoles
                ? "Define what each role can do in your organization."
                : "View team roles and what they can do in your organization."}
            </p>
          </div>
        </div>
        {canWrite ? (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shadow-sm"
          >
            <Plus className="size-4" />
            New role
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {status === "error" ? (
          <div className="space-y-4 p-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error ?? "Failed to load roles."}
            </div>
            <Button variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[280px_1fr]">
            {isLoading ? (
              <>
                <div className="space-y-2 border-r p-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
                <RolePermissionsPanelSkeleton />
              </>
            ) : roles.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-4 p-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Shield className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No roles found</p>
                  <p className="text-sm text-muted-foreground">
                    Create a role to manage permissions for your team.
                  </p>
                </div>
                {canWrite ? (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="size-4" />
                    New role
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <RoleListPanel
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  onSelectRole={selectRole}
                />
                <RolePermissionsPanel
                  role={selectedRole}
                  permissions={permissions}
                  draftPermissions={draftPermissions}
                  canWrite={canWrite}
                  isDirty={isDirty}
                  isSaving={isSaving}
                  onTogglePermission={togglePermission}
                  onSave={() => void handleSave()}
                  onDiscard={discardChanges}
                  onDelete={
                    selectedRole?.canDelete
                      ? () => setDeleteDialogOpen(true)
                      : undefined
                  }
                />
              </>
            )}
          </div>
        )}
      </div>

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        permissions={permissions}
        onCreated={addRole}
      />

      {selectedRole ? (
        <DeleteRoleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          roleName={selectedRole.name}
          isSubmitting={isDeleting}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
};
