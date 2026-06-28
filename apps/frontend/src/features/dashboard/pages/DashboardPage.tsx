import { LayoutDashboard } from "lucide-react";
import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthUser,
  selectHasAnyPermission,
  selectHasModule,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import {
  DASHBOARD_PERMISSIONS,
  LEADS_READ_PERMISSIONS,
} from "@/constants/permissions";
import { formatRoleLabel } from "@/lib/format";

import { CustomizeDashboardSheet } from "../components/CustomizeDashboardSheet";
import { DashboardGrid } from "../components/DashboardGrid";
import { DashboardNoAccess } from "../components/DashboardNoAccess";
import {
  selectDashboardError,
  selectDashboardLayout,
  selectDashboardSummary,
  selectIsDashboardLoading,
} from "../dashboardSelectors";
import { fetchDashboard } from "../dashboardSlice";

const viewTitle = {
  me: "My dashboard",
  team: "Team dashboard",
  org: "Organization dashboard",
} as const;

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const hasDashboardsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.DASHBOARDS),
  );
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const hasDashboard = useAppSelector(
    selectHasAnyPermission([...DASHBOARD_PERMISSIONS]),
  );
  const canViewLeads = useAppSelector(
    selectHasAnyPermission([...LEADS_READ_PERMISSIONS]),
  );
  const summary = useAppSelector(selectDashboardSummary);
  const layout = useAppSelector(selectDashboardLayout);
  const error = useAppSelector(selectDashboardError);
  const isLoading = useAppSelector(selectIsDashboardLoading);

  useEffect(() => {
    if (!hasDashboardsModule || !hasDashboard) {
      return;
    }

    void dispatch(fetchDashboard());
  }, [dispatch, hasDashboard, hasDashboardsModule]);

  if (!hasDashboardsModule) {
    return <Navigate to="/" replace />;
  }

  if (!hasDashboard) {
    return <DashboardNoAccess />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-4" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {summary ? viewTitle[summary.view] : "Dashboard"}
              </h1>
              {user?.role ? (
                <p className="text-sm text-muted-foreground">
                  {formatRoleLabel(user.role)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {layout ? <CustomizeDashboardSheet layout={layout} /> : null}
          {hasSalesErpModule && canViewLeads ? (
            <Button variant="outline" asChild>
              <Link to="/leads">View leads</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : summary && layout ? (
        <DashboardGrid layout={layout} summary={summary} />
      ) : null}
    </div>
  );
};
