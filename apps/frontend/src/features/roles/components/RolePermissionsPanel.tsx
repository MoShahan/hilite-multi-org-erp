import { Lock, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getMembershipScopeLabel,
  isPermissionDisabledForRole,
  isTeamGrantPermission,
} from "../permissionScopeUtils";

import { PermissionToggleRow } from "./PermissionToggleRow";

import type { PermissionCatalogItem, Role } from "../rolesTypes";

type RolePermissionsPanelProps = {
  role: Role | null;
  permissions: PermissionCatalogItem[];
  draftPermissions: string[];
  canWrite: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onTogglePermission: (permissionKey: string, enabled: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
};

export const RolePermissionsPanel = ({
  role,
  permissions,
  draftPermissions,
  canWrite,
  isDirty,
  isSaving,
  onTogglePermission,
  onSave,
  onDiscard,
  onDelete,
}: RolePermissionsPanelProps) => {
  if (!role) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Select a role</p>
          <p className="text-sm text-muted-foreground">
            Choose a role from the list to view and edit its permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{role.name}</h2>
            <Badge variant="outline" className="font-mono text-[11px] font-normal">
              {role.slug}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-normal">
              {getMembershipScopeLabel(role.membershipScope)}
            </Badge>
            {role.isProtected ? (
              <Badge variant="secondary" className="text-[11px] font-normal">
                Default role
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {role.userCount} user{role.userCount === 1 ? "" : "s"} assigned
          </p>
        </div>
        {canWrite && role.canDelete && onDelete ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : null}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-5">
        {permissions.map((permission) => {
          const scopeDisabled = isPermissionDisabledForRole(
            permission,
            role.membershipScope,
          );
          const disabled = !canWrite || isSaving || scopeDisabled;

          return (
            <PermissionToggleRow
              key={permission.key}
              label={permission.label}
              description={permission.description}
              checked={draftPermissions.includes(permission.key)}
              disabled={disabled}
              disabledReason={
                scopeDisabled
                  ? "Not available for team-based roles"
                  : undefined
              }
              badge={
                isTeamGrantPermission(permission)
                  ? "Requires team membership"
                  : undefined
              }
              onCheckedChange={(checked) =>
                onTogglePermission(permission.key, checked)
              }
            />
          );
        })}
      </div>

      {canWrite && isDirty ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-card/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <p className="text-sm text-muted-foreground">Unsaved changes</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={isSaving}
            >
              Discard
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const RolePermissionsPanelSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col gap-3 p-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
};
