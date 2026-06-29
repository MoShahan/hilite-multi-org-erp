import { Router } from "express";

import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";
import { requireNotificationsAccess } from "../middleware/requireNotificationsAccess";

const router = Router();

const auth = [authenticate, requireNotificationsAccess];

router.get("/", ...auth, listNotifications);
router.get("/unread-count", ...auth, getUnreadCount);
router.patch("/read-all", ...auth, markAllNotificationsRead);
router.patch("/:id/read", ...auth, markNotificationRead);

export default router;
