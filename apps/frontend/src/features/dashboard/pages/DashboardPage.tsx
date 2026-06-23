import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthUser,
  selectHasAnyPermission,
  selectHasModule,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { formatRoleLabel } from "@/lib/format";

import { DashboardNoAccess } from "../components/DashboardNoAccess";
import { DirectorDashboard } from "../components/DirectorDashboard";
import { ExecutiveDashboard } from "../components/ExecutiveDashboard";
import { TeamLeadDashboard } from "../components/TeamLeadDashboard";
import { dashboardService } from "../dashboardService";

import type { DashboardSummaryResponse } from "../dashboardTypes";

const DASHBOARD_PERMISSIONS = [
  "dashboard:executive",
  "dashboard:team_lead",
  "dashboard:director",
] as const;

const LEADS_READ_PERMISSIONS = [
  "leads:read",
  "leads:read:team",
  "leads:read:org",
] as const;

const viewTitle: Record<DashboardSummaryResponse["view"], string> = {
  executive: "Executive dashboard",
  team_lead: "Team lead dashboard",
  director: "Director dashboard",
};

export const DashboardPage = () => {
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

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasDashboardsModule || !hasDashboard) {
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    void dashboardService
      .getSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setStatus("success");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasDashboard, hasDashboardsModule]);

  if (!hasDashboardsModule) {
    return <Navigate to="/" replace />;
  }

  if (!hasDashboard) {
    return <DashboardNoAccess />;
  }

  const isLoading = status === "loading" || status === "idle";

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
        {hasSalesErpModule && canViewLeads ? (
          <Button variant="outline" asChild>
            <Link to="/leads">View leads</Link>
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : summary?.view === "executive" ? (
        <ExecutiveDashboard summary={summary} />
      ) : summary?.view === "team_lead" ? (
        <TeamLeadDashboard summary={summary} />
      ) : summary?.view === "director" ? (
        <DirectorDashboard summary={summary} />
      ) : null}
    </div>
  );
};
