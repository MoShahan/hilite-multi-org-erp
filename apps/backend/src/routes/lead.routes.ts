import { Router } from "express";
import {
  assignLead,
  createActivity,
  createLead,
  getLead,
  listActivities,
  listLeads,
  listStatusHistory,
  updateLead,
} from "../controllers/lead.controller";
import { PERMISSIONS } from "../constants/permissions";
import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requireOrgModule } from "../middleware/requireOrgModule";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const salesErpModule = [
  authenticate,
  requireOrgModule(ORG_MODULE_KEYS.SALES_ERP),
];

const leadsRead = [
  requireAnyPermission(
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_READ_TEAM,
    PERMISSIONS.LEADS_READ_ORG,
  ),
];

const leadsWrite = [requirePermission(PERMISSIONS.LEADS_WRITE)];

const leadsUpdate = [
  requireAnyPermission(
    PERMISSIONS.LEADS_WRITE,
    PERMISSIONS.LEADS_STATUS_WRITE,
    PERMISSIONS.LEADS_STATUS_WRITE_TEAM,
  ),
];

const leadsReassign = [
  requirePermission(PERMISSIONS.LEADS_WRITE, PERMISSIONS.LEADS_READ_TEAM),
];

const activitiesWrite = [requirePermission(PERMISSIONS.ACTIVITIES_WRITE)];

router.get("/", ...salesErpModule, ...leadsRead, listLeads);
router.post("/", ...salesErpModule, ...leadsWrite, createLead);
router.get("/:id", ...salesErpModule, ...leadsRead, getLead);
router.patch("/:id", ...salesErpModule, ...leadsUpdate, updateLead);
router.patch("/:id/assign", ...salesErpModule, ...leadsReassign, assignLead);
router.get("/:id/activities", ...salesErpModule, ...leadsRead, listActivities);
router.get(
  "/:id/status-history",
  ...salesErpModule,
  ...leadsRead,
  listStatusHistory,
);
router.post("/:id/activities", ...salesErpModule, ...activitiesWrite, createActivity);

export default router;
