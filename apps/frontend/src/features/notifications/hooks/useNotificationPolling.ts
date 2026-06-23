import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectAuthOrganization,
  selectHasModule,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { fetchUnreadCount } from "../notificationsSlice";

const POLL_INTERVAL_MS = 45_000;

export const useNotificationPolling = (): void => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const organization = useAppSelector(selectAuthOrganization);
  const hasNotificationsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.NOTIFICATIONS),
  );

  useEffect(() => {
    if (!isAuthenticated || !organization || !hasNotificationsModule) {
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
  }, [dispatch, hasNotificationsModule, isAuthenticated, organization?.id]);
};
