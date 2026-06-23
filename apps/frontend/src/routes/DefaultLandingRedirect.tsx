import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import {
  selectHasAnyPermission,
  selectHasModule,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";

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

export const DefaultLandingRedirect = () => {
  const hasDashboardsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.DASHBOARDS),
  );
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const hasDashboardPermission = useAppSelector(
    selectHasAnyPermission([...DASHBOARD_PERMISSIONS]),
  );
  const canViewLeads = useAppSelector(
    selectHasAnyPermission([...LEADS_READ_PERMISSIONS]),
  );
  const canViewUsers = useAppSelector(selectHasAnyPermission(["users:read"]));
  const canViewTeams = useAppSelector(selectHasAnyPermission(["teams:read"]));
  const canViewRoles = useAppSelector(selectHasAnyPermission(["roles:read"]));

  if (hasDashboardsModule && hasDashboardPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  if (hasSalesErpModule && canViewLeads) {
    return <Navigate to="/leads" replace />;
  }

  if (canViewUsers) {
    return <Navigate to="/users" replace />;
  }

  if (canViewTeams) {
    return <Navigate to="/teams" replace />;
  }

  if (canViewRoles) {
    return <Navigate to="/roles" replace />;
  }

  return <Navigate to="/home" replace />;
};
