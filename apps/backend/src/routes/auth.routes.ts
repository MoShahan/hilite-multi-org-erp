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

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.post("/change-password", authenticate, changePassword);
router.post("/logout", logout);

export default router;
