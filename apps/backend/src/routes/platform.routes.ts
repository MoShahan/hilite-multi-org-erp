import { Router } from "express";
import {
  createOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
  updateOrganizationStatus,
} from "../controllers/organization.controller";
import { UserRole } from "../generated/prisma/client";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = Router();

const platformAdmin = [authenticate, requireRole(UserRole.PLATFORM_ADMIN)];

router.get("/organizations", ...platformAdmin, listOrganizations);
router.post("/organizations", ...platformAdmin, createOrganization);
router.get("/organizations/:id", ...platformAdmin, getOrganization);
router.patch("/organizations/:id", ...platformAdmin, updateOrganization);
router.patch(
  "/organizations/:id/status",
  ...platformAdmin,
  updateOrganizationStatus,
);

export default router;
