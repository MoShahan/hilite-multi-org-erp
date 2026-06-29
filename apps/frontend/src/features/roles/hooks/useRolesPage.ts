import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppSelector } from "@/app/hooks";
import {
  selectHasPermission,
  selectHasAnyPermission,
} from "@/features/auth/authSelectors";

import { rolesService } from "../rolesService";

import type { PermissionCatalogItem, Role } from "../rolesTypes";

const permissionsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const leftSet = new Set(left);
  return right.every((permission) => leftSet.has(permission));
};

export const useRolesPage = () => {
  const canReadAllRoles = useAppSelector(selectHasPermission("roles:read"));
  const canReadTeamRoles = useAppSelector(
    selectHasAnyPermission(["roles:read:team"]),
  );
  const listRolesOptions = useMemo(
    () =>
      !canReadAllRoles && canReadTeamRoles
        ? ({ assignableFrom: "team" } as const)
        : undefined,
    [canReadAllRoles, canReadTeamRoles],
  );

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const isDirty = useMemo(() => {
    if (!selectedRole) {
      return false;
    }

    return !permissionsEqual(selectedRole.permissions, draftPermissions);
  }, [draftPermissions, selectedRole]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        rolesService.listRoles(listRolesOptions ?? {}),
        rolesService.listPermissions(),
      ]);

      setRoles(rolesResult);
      setPermissions(permissionsResult);
      setStatus("success");

      setSelectedRoleId((current) => {
        if (current && rolesResult.some((role) => role.id === current)) {
          return current;
        }

        return rolesResult[0]?.id ?? null;
      });
    } catch (loadError) {
      setStatus("error");
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load roles",
      );
    }
  }, [listRolesOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions([...selectedRole.permissions]);
    } else {
      setDraftPermissions([]);
    }
  }, [selectedRole]);

  const selectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const togglePermission = (permissionKey: string, enabled: boolean) => {
    setDraftPermissions((current) => {
      if (enabled) {
        return current.includes(permissionKey)
          ? current
          : [...current, permissionKey];
      }

      return current.filter((key) => key !== permissionKey);
    });
  };

  const discardChanges = () => {
    if (selectedRole) {
      setDraftPermissions([...selectedRole.permissions]);
    }
  };

  const saveChanges = async () => {
    if (!selectedRole || !isDirty) {
      return null;
    }

    setIsSaving(true);

    try {
      const updated = await rolesService.updateRole(selectedRole.id, {
        permissions: draftPermissions,
      });

      setRoles((current) =>
        current.map((role) => (role.id === updated.id ? updated : role)),
      );

      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const addRole = (role: Role) => {
    setRoles((current) => [...current, role].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedRoleId(role.id);
  };

  const removeRole = (roleId: string) => {
    setRoles((current) => {
      const next = current.filter((role) => role.id !== roleId);
      setSelectedRoleId((selected) => {
        if (selected !== roleId) {
          return selected;
        }

        return next[0]?.id ?? null;
      });
      return next;
    });
  };

  return {
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
  };
};
