import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { PageSkeleton } from "@/components/PageSkeleton";

import { selectAuthStatus, selectIsAuthenticated } from "../authSelectors";

export const GuestRoute = () => {
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (status === "idle" || status === "loading") {
    return <PageSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
