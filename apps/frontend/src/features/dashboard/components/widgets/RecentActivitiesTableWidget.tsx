import { RecentActivitiesTable } from "../RecentActivitiesTable";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type RecentActivitiesTableWidgetProps = {
  summary: DashboardSummaryBase;
};

export const RecentActivitiesTableWidget = ({
  summary,
}: RecentActivitiesTableWidgetProps) => (
  <RecentActivitiesTable activities={summary.recentActivities} />
);
