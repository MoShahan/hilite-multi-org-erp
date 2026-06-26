import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { PERMISSIONS } from "../constants/permissions";
import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requirePermission";
import { requireOrgModule } from "../middleware/requireOrgModule";

const router = Router();

const dashboardRead = [
  authenticate,
  requireOrgModule(ORG_MODULE_KEYS.DASHBOARDS),
  requireAnyPermission(
    PERMISSIONS.DASHBOARD_ME,
    PERMISSIONS.DASHBOARD_TEAM,
    PERMISSIONS.DASHBOARD_ORG,
  ),
];

router.get("/summary", ...dashboardRead, getDashboardSummary);

export default router;
