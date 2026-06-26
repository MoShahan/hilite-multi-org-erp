import { Router } from "express";
import {
  getDashboardLayout,
  getDashboardSummary,
  resetDashboardLayout,
  updateDashboardLayout,
} from "../controllers/dashboard.controller";
import { PERMISSIONS } from "../constants/permissions";
import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
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
router.get("/layout", ...dashboardRead, getDashboardLayout);
router.put("/layout", ...dashboardRead, updateDashboardLayout);
router.post("/layout/reset", ...dashboardRead, resetDashboardLayout);

export default router;
