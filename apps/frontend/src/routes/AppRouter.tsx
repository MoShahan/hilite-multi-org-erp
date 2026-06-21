import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { AppLayout } from "@/layouts/AppLayout";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);

const OrganizationsPage = lazy(() =>
  import("@/features/platform/pages/OrganizationsPage").then((module) => ({
    default: module.OrganizationsPage,
  })),
);

const OrganizationDetailPage = lazy(() =>
  import("@/features/platform/pages/OrganizationDetailPage").then((module) => ({
    default: module.OrganizationDetailPage,
  })),
);

const PlatformAdminLayout = ({ children }: { children: ReactNode }) => (
  <RequireRole roles={["PLATFORM_ADMIN"]}>
    <AppLayout>{children}</AppLayout>
  </RequireRole>
);

export const AppRouter = () => {
  return (
    <>
      <AuthBootstrap />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              }
            />
            <Route
              path="/platform/organizations"
              element={
                <PlatformAdminLayout>
                  <OrganizationsPage />
                </PlatformAdminLayout>
              }
            />
            <Route
              path="/platform/organizations/:id"
              element={
                <PlatformAdminLayout>
                  <OrganizationDetailPage />
                </PlatformAdminLayout>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};
