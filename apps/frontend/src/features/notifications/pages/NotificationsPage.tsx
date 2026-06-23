import { Bell } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthOrganization,
  selectHasModule,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { NotificationItem } from "../components/NotificationItem";
import { NotificationsListToolbar } from "../components/NotificationsListToolbar";
import { useNotificationListQuery } from "../hooks/useNotificationListQuery";
import { hasActiveListFilters } from "../notificationListParams";
import {
  selectNotifications,
  selectNotificationsListError,
  selectNotificationsListMeta,
  selectNotificationsListStatus,
} from "../notificationsSelectors";
import { markNotificationRead } from "../notificationsSlice";

import type { Notification } from "../notificationsTypes";

export const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const organization = useAppSelector(selectAuthOrganization);
  const hasNotificationsModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.NOTIFICATIONS),
  );
  const { query, patchQuery, clearFilters, refetch } = useNotificationListQuery();

  const notifications = useAppSelector(selectNotifications);
  const listMeta = useAppSelector(selectNotificationsListMeta);
  const listStatus = useAppSelector(selectNotificationsListStatus);
  const listError = useAppSelector(selectNotificationsListError);

  if (!organization) {
    return <Navigate to="/" replace />;
  }

  if (!hasNotificationsModule) {
    return <Navigate to="/" replace />;
  }

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) {
      void dispatch(markNotificationRead(notification.id));
    }

    if (notification.entityType === "lead" && notification.entityId) {
      navigate(`/leads/${notification.entityId}`);
    }
  };

  const isLoading = listStatus === "idle" || listStatus === "loading";
  const total = listMeta?.total ?? 0;
  const hasFilters = hasActiveListFilters(query);
  const showFilteredEmpty =
    !isLoading && listStatus === "success" && total === 0 && hasFilters;
  const showGlobalEmpty =
    !isLoading && listStatus === "success" && total === 0 && !hasFilters;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Your activity and lead updates in one place.
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <NotificationsListToolbar
          query={query}
          total={total}
          onQueryChange={patchQuery}
          onMarkAllReadComplete={refetch}
        />

        {listStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError ?? "Failed to load notifications."}
          </div>
        ) : null}

        {isLoading ? (
          <div className="divide-y rounded-xl border">
            {Array.from({ length: query.pageSize }).map((_, index) => (
              <div key={index} className="p-3">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : null}

        {showGlobalEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Bell className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                Lead and activity updates will appear here.
              </p>
            </div>
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No unread notifications</p>
              <p className="text-sm text-muted-foreground">
                You are all caught up.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Show all notifications
            </Button>
          </div>
        ) : null}

        {!isLoading && notifications.length > 0 && listMeta ? (
          <>
            <div className="divide-y rounded-xl border">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onSelect={handleSelect}
                />
              ))}
            </div>
            <ListPagination
              page={query.page}
              pageSize={query.pageSize}
              totalPages={listMeta.totalPages}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={(page) => patchQuery({ page })}
              onPageSizeChange={(pageSize) =>
                patchQuery({ pageSize, page: 1 })
              }
              className="border-t pt-4"
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
