import { Router } from "express";
import { createUserSchema } from "@hilite/shared";
import { createUser, listUserOptions, listUsers, updateUserStatus } from "../controllers/user.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requirePermission } from "../middleware/requirePermission";
import { validateBody } from "../middleware/validateBody";

const router = Router();

const usersList = [
  authenticate,
  requireAnyPermission(
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_READ_TEAM,
  ),
];
const userOptionsList = [
  authenticate,
  requireAnyPermission(
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_READ_TEAM,
    PERMISSIONS.LEADS_WRITE,
  ),
];
const usersWrite = [authenticate, requirePermission(PERMISSIONS.USERS_WRITE)];

router.get("/options", ...userOptionsList, listUserOptions);
router.get("/", ...usersList, listUsers);
router.post("/", ...usersWrite, validateBody(createUserSchema), createUser);
router.patch("/:id/status", ...usersWrite, updateUserStatus);

export default router;
