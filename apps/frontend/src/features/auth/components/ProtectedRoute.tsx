import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { PageSkeleton } from "@/components/PageSkeleton";

import { selectAuthStatus } from "../authSelectors";

export const ProtectedRoute = () => {
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return <PageSkeleton />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
