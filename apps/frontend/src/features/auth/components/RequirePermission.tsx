import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

import { selectAuthPermissions } from "../authSelectors";

import type { ReactNode } from "react";

type RequirePermissionProps = {
  permissions: string[];
  mode?: "all" | "any";
  children: ReactNode;
};

export const RequirePermission = ({
  permissions,
  mode = "all",
  children,
}: RequirePermissionProps) => {
  const userPermissions = useAppSelector(selectAuthPermissions);

  const hasPermission =
    mode === "any"
      ? permissions.some((permission) => userPermissions.includes(permission))
      : permissions.every((permission) => userPermissions.includes(permission));

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};
