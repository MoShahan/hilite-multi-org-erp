import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectCanAccessNotifications,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";

import { fetchUnreadCount } from "../notificationsSlice";

const POLL_INTERVAL_MS = 60_000;

export const useNotificationPolling = (): void => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccessNotifications = useAppSelector(selectCanAccessNotifications);

  useEffect(() => {
    if (!isAuthenticated || !canAccessNotifications) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void dispatch(fetchUnreadCount());
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canAccessNotifications, dispatch, isAuthenticated]);
};
