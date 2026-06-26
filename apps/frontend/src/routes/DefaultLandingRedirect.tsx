import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import {
  selectHasAnyPermission,
  selectHasModule,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import {
  DASHBOARD_PERMISSIONS,
  LEADS_READ_PERMISSIONS,
  PERMISSIONS,
} from "@/constants/permissions";

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
  const canViewUsers = useAppSelector(
    selectHasAnyPermission([PERMISSIONS.USERS_READ]),
  );
  const canViewTeams = useAppSelector(
    selectHasAnyPermission([PERMISSIONS.TEAMS_READ]),
  );
  const canViewRoles = useAppSelector(
    selectHasAnyPermission([
      PERMISSIONS.ROLES_READ,
      PERMISSIONS.ROLES_READ_TEAM,
    ]),
  );

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
