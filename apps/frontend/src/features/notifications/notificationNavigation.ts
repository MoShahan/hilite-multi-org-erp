import type { Notification } from "./notificationsTypes";

export const getNotificationDestination = (
  notification: Notification,
): string | null => {
  if (
    notification.type === "WELCOME_CHANGE_PASSWORD" ||
    notification.entityType === "account"
  ) {
    return "/account";
  }

  if (notification.entityType === "lead" && notification.entityId) {
    return `/leads/${notification.entityId}`;
  }

  return null;
};
