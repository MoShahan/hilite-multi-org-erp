import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "../controllers/role.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const rolesRead = [authenticate, requirePermission(PERMISSIONS.ROLES_READ)];
const rolesWrite = [authenticate, requirePermission(PERMISSIONS.ROLES_WRITE)];

router.get("/", ...rolesRead, listRoles);
router.post("/", ...rolesWrite, createRole);
router.get("/:id", ...rolesRead, getRole);
router.patch("/:id", ...rolesWrite, updateRole);
router.delete("/:id", ...rolesWrite, deleteRole);

export default router;
