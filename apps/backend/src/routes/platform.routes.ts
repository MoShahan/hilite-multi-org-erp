import {
  createPlatformUserSchema,
  updatePlatformUserStatusSchema,
} from "@hilite/shared";
import { Router } from "express";

import { PERMISSIONS } from "../constants/permissions";
import { listPlatformAuditLogs } from "../controllers/audit.controller";
import {
  createOrganization,
  getOrganization,
  getOrganizationModules,
  listOrganizationOptions,
  listOrganizations,
  updateOrganization,
  updateOrganizationModules,
  updateOrganizationStatus,
} from "../controllers/organization.controller";
import {
  createPlatformUser,
  listPlatformUsers,
  updatePlatformUserStatus,
} from "../controllers/platformUser.controller";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";
import { validateBody } from "../middleware/validateBody";

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

const platformUsersRead = [
  authenticate,
  requirePermission(PERMISSIONS.PLATFORM_USERS_READ),
];

const platformUsersWrite = [
  authenticate,
  requirePermission(PERMISSIONS.PLATFORM_USERS_WRITE),
];

router.get("/audit", ...platformAuditRead, listPlatformAuditLogs);

router.get("/users", ...platformUsersRead, listPlatformUsers);
router.post(
  "/users",
  ...platformUsersWrite,
  validateBody(createPlatformUserSchema),
  createPlatformUser,
);
router.patch(
  "/users/:id/status",
  ...platformUsersWrite,
  validateBody(updatePlatformUserStatusSchema),
  updatePlatformUserStatus,
);

router.get("/organizations/options", ...platformRead, listOrganizationOptions);
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

export default router;
