import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Notification } from "../notificationsTypes";

type NotificationItemProps = {
  notification: Notification;
  onSelect: (notification: Notification) => void;
};

export const NotificationItem = ({
  notification,
  onSelect,
}: NotificationItemProps) => {
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/80",
        isUnread && "bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-sm leading-snug",
            isUnread ? "font-medium text-foreground" : "text-foreground/90",
          )}
        >
          {notification.title}
        </p>
        {isUnread ? (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {notification.body}
      </p>
      <p className="text-[11px] text-muted-foreground/80">
        {formatRelativeTime(notification.createdAt)}
      </p>
    </button>
  );
};
