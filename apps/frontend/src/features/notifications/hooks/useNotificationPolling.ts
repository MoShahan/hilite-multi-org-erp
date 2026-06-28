import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectCanAccessNotifications,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import { fetchUnreadCount } from "../notificationsSlice";

const POLL_INTERVAL_MS = 45_000;

export const useNotificationPolling = (): void => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccessNotifications = useAppSelector(selectCanAccessNotifications);

  useEffect(() => {
    if (!isAuthenticated || !canAccessNotifications) {
      return;
    }

    const refreshUnreadCount = () => {
      void dispatch(fetchUnreadCount());
    };

    refreshUnreadCount();

    const intervalId = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    const handleFocus = () => {
      refreshUnreadCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [canAccessNotifications, dispatch, isAuthenticated]);
};
