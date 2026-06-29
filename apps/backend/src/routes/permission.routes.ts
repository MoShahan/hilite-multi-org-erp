import { Router } from "express";

import { PERMISSIONS } from "../constants/permissions";
import { listPermissions } from "../controllers/permission.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";

const router = Router();

router.get(
  "/",
  authenticate,
  requireAnyPermission(PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_READ_TEAM),
  listPermissions,
);

export default router;
