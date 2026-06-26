import {
  PerformanceBarChart,
  toPerformanceRows,
} from "../charts/PerformanceBarChart";

import type { TeamDashboardSummary } from "../../dashboardTypes";

type AssigneePerformanceChartWidgetProps = {
  summary: TeamDashboardSummary;
};

export const AssigneePerformanceChartWidget = ({
  summary,
}: AssigneePerformanceChartWidgetProps) => (
  <PerformanceBarChart
    title="Team performance (chart)"
    description="Bar chart of leads by assignee"
    stats={toPerformanceRows(summary.assigneeStats)}
  />
);
