import type { RootState } from "@/app/store";
import {
  selectHasAnyPermission,
  selectHasModule,
  selectIsPlatformAdmin,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import {
  DASHBOARD_PERMISSIONS,
  LEADS_READ_PERMISSIONS,
  PERMISSIONS,
} from "@/constants/permissions";

export const selectCanViewDashboard = (state: RootState) =>
  selectHasModule(ORG_MODULE_KEYS.DASHBOARDS)(state) &&
  selectHasAnyPermission([...DASHBOARD_PERMISSIONS])(state);

/** First sidebar route the current user can access, in sidebar order. */
export const selectDefaultLandingPath = (state: RootState): string => {
  if (selectCanViewDashboard(state)) {
    return "/dashboard";
  }

  if (selectHasAnyPermission([PERMISSIONS.PLATFORM_AUDIT_READ])(state)) {
    return "/platform/audit";
  }

  if (selectIsPlatformAdmin(state)) {
    return "/platform/organizations";
  }

  const hasSalesErpModule = selectHasModule(ORG_MODULE_KEYS.SALES_ERP)(state);
  const canViewLeads = selectHasAnyPermission([...LEADS_READ_PERMISSIONS])(state);
  if (hasSalesErpModule && canViewLeads) {
    return "/leads";
  }

  const canViewTeams = selectHasAnyPermission([PERMISSIONS.TEAMS_READ])(state);
  const canViewMyTeam =
    selectHasAnyPermission([PERMISSIONS.USERS_READ_TEAM])(state) &&
    !canViewTeams;
  if (canViewMyTeam) {
    return "/my-team";
  }

  if (selectHasAnyPermission([PERMISSIONS.USERS_READ])(state)) {
    return "/users";
  }

  if (canViewTeams) {
    return "/teams";
  }

  if (selectHasAnyPermission([PERMISSIONS.AUDIT_READ])(state)) {
    return "/audit";
  }

  if (selectHasAnyPermission([PERMISSIONS.ROLES_WRITE])(state)) {
    return "/roles";
  }

  return "/home";
};
