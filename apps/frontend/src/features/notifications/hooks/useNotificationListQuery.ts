import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectHasModule } from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";

import {
  clearListFilters,
  parseNotificationListParams,
  serializeNotificationListParams,
} from "../notificationListParams";
import { fetchNotifications } from "../notificationsSlice";

import type { NotificationListQuery } from "../notificationsTypes";

export const useNotificationListQuery = () => {
  const dispatch = useAppDispatch();
  const hasNotificationsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.NOTIFICATIONS),
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => parseNotificationListParams(searchParams),
    [searchParams],
  );

  const setQuery = useCallback(
    (next: NotificationListQuery) => {
      setSearchParams(serializeNotificationListParams(next), { replace: true });
    },
    [setSearchParams],
  );

  const patchQuery = useCallback(
    (patch: Partial<NotificationListQuery>) => {
      const next = { ...query, ...patch };
      const shouldResetPage =
        ("filter" in patch || "pageSize" in patch) && !("page" in patch);

      if (shouldResetPage) {
        next.page = 1;
      }

      setQuery(next);
    },
    [query, setQuery],
  );

  const clearFilters = useCallback(() => {
    setQuery(clearListFilters(query));
  }, [query, setQuery]);

  const refetch = useCallback(() => {
    void dispatch(fetchNotifications(query));
  }, [dispatch, query]);

  useEffect(() => {
    if (!hasNotificationsModule) {
      return;
    }

    void dispatch(fetchNotifications(query));
  }, [dispatch, hasNotificationsModule, query]);

  return {
    query,
    setQuery,
    patchQuery,
    clearFilters,
    refetch,
  };
};
