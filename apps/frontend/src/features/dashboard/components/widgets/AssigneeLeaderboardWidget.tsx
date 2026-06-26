import { AssigneeStatsTable } from "../AssigneeStatsTable";

import type { TeamDashboardSummary } from "../../dashboardTypes";

type AssigneeLeaderboardWidgetProps = {
  summary: TeamDashboardSummary;
};

export const AssigneeLeaderboardWidget = ({
  summary,
}: AssigneeLeaderboardWidgetProps) => (
  <AssigneeStatsTable stats={summary.assigneeStats} />
);
