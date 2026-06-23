import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import permissionRoutes from "./permission.routes";
import platformRoutes from "./platform.routes";
import roleRoutes from "./role.routes";
import teamRoutes from "./team.routes";
import userRoutes from "./user.routes";
import leadRoutes from "./lead.routes";
import notificationRoutes from "./notification.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use(healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/platform", platformRoutes);
router.use("/api/v1/permissions", permissionRoutes);
router.use("/api/v1/roles", roleRoutes);
router.use("/api/v1/teams", teamRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/leads", leadRoutes);
router.use("/api/v1/notifications", notificationRoutes);
router.use("/api/v1/dashboard", dashboardRoutes);

export default router;
