import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { AppLayout } from "@/layouts/AppLayout";
import { DefaultLandingRedirect } from "@/routes/DefaultLandingRedirect";

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

const PlatformAuditPage = lazy(() =>
  import("@/features/platform/pages/PlatformAuditPage").then((module) => ({
    default: module.PlatformAuditPage,
  })),
);

const AuditPage = lazy(() =>
  import("@/features/audit/pages/AuditPage").then((module) => ({
    default: module.AuditPage,
  })),
);

const RolesPage = lazy(() =>
  import("@/features/roles/pages/RolesPage").then((module) => ({
    default: module.RolesPage,
  })),
);

const UsersPage = lazy(() =>
  import("@/features/users/pages/UsersPage").then((module) => ({
    default: module.UsersPage,
  })),
);

const TeamsPage = lazy(() =>
  import("@/features/teams/pages/TeamsPage").then((module) => ({
    default: module.TeamsPage,
  })),
);

const TeamDetailPage = lazy(() =>
  import("@/features/teams/pages/TeamDetailPage").then((module) => ({
    default: module.TeamDetailPage,
  })),
);

const MyTeamPage = lazy(() =>
  import("@/features/teams/pages/MyTeamPage").then((module) => ({
    default: module.MyTeamPage,
  })),
);

const LeadsPage = lazy(() =>
  import("@/features/leads/pages/LeadsPage").then((module) => ({
    default: module.LeadsPage,
  })),
);

const LeadDetailPage = lazy(() =>
  import("@/features/leads/pages/LeadDetailPage").then((module) => ({
    default: module.LeadDetailPage,
  })),
);

const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);

const PrivacyPage = lazy(() =>
  import("@/features/legal/pages/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  })),
);

const TermsPage = lazy(() =>
  import("@/features/legal/pages/TermsPage").then((module) => ({
    default: module.TermsPage,
  })),
);

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);

const AccountPage = lazy(() =>
  import("@/features/account/pages/AccountPage").then((module) => ({
    default: module.AccountPage,
  })),
);

const PlatformAdminLayout = ({ children }: { children: ReactNode }) => (
  <RequirePermission permissions={["platform:orgs:read"]}>
    <AppLayout>{children}</AppLayout>
  </RequirePermission>
);

const PlatformAuditLayout = ({ children }: { children: ReactNode }) => (
  <RequirePermission permissions={["platform:audit:read"]}>
    <AppLayout>{children}</AppLayout>
  </RequirePermission>
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
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DefaultLandingRedirect />} />
            <Route
              path="/home"
              element={
                <AppLayout>
                  <HomePage />
                </AppLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              }
            />
            <Route
              path="/audit"
              element={
                <RequirePermission permissions={["audit:read"]}>
                  <AppLayout>
                    <AuditPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/roles"
              element={
                <RequirePermission
                  permissions={["roles:read", "roles:read:team"]}
                  mode="any"
                >
                  <AppLayout>
                    <RolesPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/users"
              element={
                <RequirePermission permissions={["users:read"]}>
                  <AppLayout>
                    <UsersPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/my-team"
              element={
                <RequirePermission permissions={["users:read:team"]}>
                  <AppLayout>
                    <MyTeamPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/teams"
              element={
                <RequirePermission permissions={["teams:read"]}>
                  <AppLayout>
                    <TeamsPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/teams/:id"
              element={
                <RequirePermission permissions={["teams:read"]}>
                  <AppLayout>
                    <TeamDetailPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/leads"
              element={
                <RequirePermission
                  permissions={[
                    "leads:read",
                    "leads:read:team",
                    "leads:read:org",
                  ]}
                  mode="any"
                >
                  <AppLayout>
                    <LeadsPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <RequirePermission
                  permissions={[
                    "leads:read",
                    "leads:read:team",
                    "leads:read:org",
                  ]}
                  mode="any"
                >
                  <AppLayout>
                    <LeadDetailPage />
                  </AppLayout>
                </RequirePermission>
              }
            />
            <Route
              path="/notifications"
              element={
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              }
            />
            <Route
              path="/account"
              element={
                <AppLayout>
                  <AccountPage />
                </AppLayout>
              }
            />
            <Route
              path="/platform/audit"
              element={
                <PlatformAuditLayout>
                  <PlatformAuditPage />
                </PlatformAuditLayout>
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
