import { Router } from "express";
import { getMe, login, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);

export default router;
