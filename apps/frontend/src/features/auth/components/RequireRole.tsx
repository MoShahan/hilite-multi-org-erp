import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

import { selectAuthUser } from "../authSelectors";

import type { UserRole } from "../authTypes";
import type { ReactNode } from "react";

type RequireRoleProps = {
  roles: UserRole[];
  children: ReactNode;
};

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const user = useAppSelector(selectAuthUser);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
