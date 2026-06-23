import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import permissionRoutes from "./permission.routes";
import platformRoutes from "./platform.routes";
import roleRoutes from "./role.routes";
import teamRoutes from "./team.routes";

const router = Router();

router.use(healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/platform", platformRoutes);
router.use("/api/v1/permissions", permissionRoutes);
router.use("/api/v1/roles", roleRoutes);
router.use("/api/v1/teams", teamRoutes);

export default router;
