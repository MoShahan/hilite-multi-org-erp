import { Bell } from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "@/app/hooks";
import {
  selectAuthOrganization,
  selectHasModule,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import {
  selectHasUnreadNotifications,
  selectUnreadCount,
} from "../notificationsSelectors";

import { NotificationDropdown } from "./NotificationDropdown";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const organization = useAppSelector(selectAuthOrganization);
  const hasNotificationsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.NOTIFICATIONS),
  );
  const unreadCount = useAppSelector(selectUnreadCount);
  const hasUnread = useAppSelector(selectHasUnreadNotifications);

  useNotificationPolling();

  if (!isAuthenticated || !organization || !hasNotificationsModule) {
    return null;
  }

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <NotificationDropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-8 rounded-full"
          aria-label={
            hasUnread
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-4" />
          {hasUnread ? (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground",
                unreadCount > 9 ? "px-1.5" : "size-4",
              )}
            >
              {badgeLabel}
            </span>
          ) : null}
        </Button>
      }
    />
  );
};
