import { useLayoutEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  selectNotificationsMutationStatus,
  selectUnreadCount,
} from "../notificationsSelectors";
import { markAllNotificationsRead } from "../notificationsSlice";

import type {
  NotificationListFilter,
  NotificationListQuery,
} from "../notificationsTypes";

type NotificationsListToolbarProps = {
  query: NotificationListQuery;
  total: number;
  onQueryChange: (patch: Partial<NotificationListQuery>) => void;
  onMarkAllReadComplete: () => void;
};

const FILTER_OPTIONS: {
  value: NotificationListFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

const FILTER_ANIMATION_MS = 300;

const ReadFilter = ({
  value,
  onChange,
}: {
  value: NotificationListFilter;
  onChange: (value: NotificationListFilter) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateIndicator = () => {
      const activeIndex = FILTER_OPTIONS.findIndex(
        (option) => option.value === value,
      );
      const activeButton = container.querySelector<HTMLElement>(
        `[data-notification-filter="${activeIndex}"]`,
      );
      if (!activeButton) return;

      setIndicator({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    };

    updateIndicator();
    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="relative flex rounded-lg border bg-background/80 p-1 shadow-sm"
    >
      <div
        aria-hidden
        className="absolute top-1 bottom-1 rounded-md bg-primary shadow-sm"
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: `left ${FILTER_ANIMATION_MS}ms ease-out, width ${FILTER_ANIMATION_MS}ms ease-out`,
        }}
      />
      {FILTER_OPTIONS.map((option, index) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            data-notification-filter={index}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-300 ease-out",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export const NotificationsListToolbar = ({
  query,
  total,
  onQueryChange,
  onMarkAllReadComplete,
}: NotificationsListToolbarProps) => {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(selectUnreadCount);
  const mutationStatus = useAppSelector(selectNotificationsMutationStatus);

  const rangeStart =
    total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const rangeEnd = Math.min(query.page * query.pageSize, total);

  const handleMarkAllRead = () => {
    void dispatch(markAllNotificationsRead()).then(() => {
      onMarkAllReadComplete();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <ReadFilter
          value={query.filter}
          onChange={(filter) => onQueryChange({ filter, page: 1 })}
        />
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={mutationStatus === "loading"}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No notifications"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
