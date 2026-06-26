import { Router } from "express";
import {
  createOrganization,
  getOrganization,
  getOrganizationModules,
  listOrganizations,
  updateOrganization,
  updateOrganizationModules,
  updateOrganizationStatus,
} from "../controllers/organization.controller";
import { listPlatformAuditLogs } from "../controllers/audit.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const platformRead = [authenticate, requirePermission(PERMISSIONS.PLATFORM_ORGS_READ)];
const platformWrite = [
  authenticate,
  requirePermission(PERMISSIONS.PLATFORM_ORGS_READ, PERMISSIONS.PLATFORM_ORGS_WRITE),
];

const platformAuditRead = [
  authenticate,
  requirePermission(PERMISSIONS.PLATFORM_AUDIT_READ),
];

router.get("/organizations", ...platformRead, listOrganizations);
router.post("/organizations", ...platformWrite, createOrganization);
router.get("/organizations/:id", ...platformRead, getOrganization);
router.patch("/organizations/:id", ...platformWrite, updateOrganization);
router.patch(
  "/organizations/:id/status",
  ...platformWrite,
  updateOrganizationStatus,
);
router.get(
  "/organizations/:id/modules",
  ...platformRead,
  getOrganizationModules,
);
router.patch(
  "/organizations/:id/modules",
  ...platformWrite,
  updateOrganizationModules,
);

router.get("/audit", ...platformAuditRead, listPlatformAuditLogs);

export default router;
