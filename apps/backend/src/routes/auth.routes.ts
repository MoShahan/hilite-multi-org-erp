import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from "@hilite/shared";
import { Router } from "express";

import {
  changePassword,
  getMe,
  login,
  logout,
  refresh,
  updateMe,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validateBody";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validateBody(updateProfileSchema), updateMe);
router.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  changePassword,
);
router.post("/logout", logout);

export default router;
