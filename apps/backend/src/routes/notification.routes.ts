import { Router } from "express";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller";
import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { authenticate } from "../middleware/authenticate";
import { requireOrgModule } from "../middleware/requireOrgModule";

const router = Router();

const auth = [authenticate, requireOrgModule(ORG_MODULE_KEYS.NOTIFICATIONS)];

router.get("/", ...auth, listNotifications);
router.get("/unread-count", ...auth, getUnreadCount);
router.patch("/read-all", ...auth, markAllNotificationsRead);
router.patch("/:id/read", ...auth, markNotificationRead);

export default router;
