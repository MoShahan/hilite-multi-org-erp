import { useNavigate } from "react-router-dom";

import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  selectNotifications,
  selectNotificationsListStatus,
  selectNotificationsMutationStatus,
  selectUnreadCount,
} from "../notificationsSelectors";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../notificationsSlice";

import { NotificationItem } from "./NotificationItem";

import type { Notification } from "../notificationsTypes";
import { getNotificationDestination } from "../notificationNavigation";

type NotificationDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
};

export const NotificationDropdown = ({
  open,
  onOpenChange,
  trigger,
}: NotificationDropdownProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const listStatus = useAppSelector(selectNotificationsListStatus);
  const mutationStatus = useAppSelector(selectNotificationsMutationStatus);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen) {
      void dispatch(
        fetchNotifications({ filter: "all", page: 1, pageSize: 10 }),
      );
    }
  };

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) {
      void dispatch(markNotificationRead(notification.id));
    }

    onOpenChange(false);

    const destination = getNotificationDestination(notification);
    if (destination) {
      navigate(destination);
    }
  };

  const handleMarkAllRead = () => {
    void dispatch(markAllNotificationsRead());
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={mutationStatus === "loading"}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-80 overflow-y-auto p-1">
          {listStatus === "loading" && notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : null}
          {listStatus !== "loading" && notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : null}
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full justify-center text-sm"
            onClick={() => {
              onOpenChange(false);
              navigate("/notifications");
            }}
          >
            See all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
