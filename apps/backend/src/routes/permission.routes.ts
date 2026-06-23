import { Router } from "express";
import { listPermissions } from "../controllers/permission.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.ROLES_READ),
  listPermissions,
);

export default router;
