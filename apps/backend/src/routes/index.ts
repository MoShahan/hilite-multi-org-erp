import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import platformRoutes from "./platform.routes";

const router = Router();

router.use(healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/platform", platformRoutes);

export default router;
