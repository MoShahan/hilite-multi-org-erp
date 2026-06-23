import { Router } from "express";
import { createUser, listUsers, updateUserStatus } from "../controllers/user.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const usersList = [
  authenticate,
  requireAnyPermission(
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_READ_TEAM,
    PERMISSIONS.LEADS_WRITE,
  ),
];
const usersWrite = [authenticate, requirePermission(PERMISSIONS.USERS_WRITE)];

router.get("/", ...usersList, listUsers);
router.post("/", ...usersWrite, createUser);
router.patch("/:id/status", ...usersWrite, updateUserStatus);

export default router;
