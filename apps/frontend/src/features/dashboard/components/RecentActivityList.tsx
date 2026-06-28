import { Link } from "react-router-dom";

import { formatDateTime } from "@/lib/format";

import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { ACTIVITY_TYPE_LABELS } from "../dashboardTypes";

import type { RecentActivityItem } from "../dashboardTypes";

type RecentActivityListProps = {
  activities: RecentActivityItem[];
};

export const RecentActivityList = ({ activities }: RecentActivityListProps) => (
  <DashboardWidgetCard
    title="Recent activity"
    description="Latest interactions on in-scope leads"
  >
    {activities.length === 0 ? (
      <p className="text-sm text-muted-foreground">No activities logged yet.</p>
    ) : (
      <div className="space-y-3">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm">
                <span className="text-muted-foreground">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </span>
                {" · "}
                <Link
                  to={`/leads/${activity.leadId}`}
                  className="font-semibold text-sidebar-primary hover:underline"
                >
                  {activity.leadName}
                </Link>
              </div>
              <time className="text-xs text-muted-foreground">
                {formatDateTime(activity.createdAt)}
              </time>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {activity.notes}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              by {activity.createdBy.name}
            </p>
          </article>
        ))}
      </div>
    )}
  </DashboardWidgetCard>
);
