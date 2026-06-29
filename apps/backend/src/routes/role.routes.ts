import { Router } from "express";

import { PERMISSIONS } from "../constants/permissions";
import {
  createRole,
  deleteRole,
  getRole,
  listRoleOptions,
  listRoles,
  updateRole,
} from "../controllers/role.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const rolesRead = [
  authenticate,
  requireAnyPermission(PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_READ_TEAM),
];
const rolesWrite = [authenticate, requirePermission(PERMISSIONS.ROLES_WRITE)];

router.get("/options", ...rolesRead, listRoleOptions);
router.get("/", ...rolesRead, listRoles);
router.post("/", ...rolesWrite, createRole);
router.get("/:id", ...rolesRead, getRole);
router.patch("/:id", ...rolesWrite, updateRole);
router.delete("/:id", ...rolesWrite, deleteRole);

export default router;
