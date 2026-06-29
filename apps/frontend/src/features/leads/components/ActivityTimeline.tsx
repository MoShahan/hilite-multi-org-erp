import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

import { ACTIVITY_TYPE_OPTIONS } from "../leadsTypes";

import type { Activity } from "../leadsTypes";

type ActivityTimelineProps = {
  activities: Activity[];
  isLoading: boolean;
};

const getActivityLabel = (type: Activity["type"]) =>
  ACTIVITY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

export const ActivityTimeline = ({
  activities,
  isLoading,
}: ActivityTimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No activities yet. Log the first interaction on this lead.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {getActivityLabel(activity.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                by {activity.createdBy.name}
              </span>
            </div>
            <time className="text-xs text-muted-foreground">
              {formatDateTime(activity.createdAt)}
            </time>
          </div>
          <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/90">
            {activity.notes}
          </p>
        </article>
      ))}
    </div>
  );
};
