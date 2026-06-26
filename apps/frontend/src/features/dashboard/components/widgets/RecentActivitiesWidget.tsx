import { RecentActivityList } from "../RecentActivityList";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type RecentActivitiesWidgetProps = {
  summary: DashboardSummaryBase;
};

export const RecentActivitiesWidget = ({
  summary,
}: RecentActivitiesWidgetProps) => (
  <RecentActivityList activities={summary.recentActivities} />
);
