import {
  PerformanceBarChart,
  type PerformanceStatRow,
} from "../charts/PerformanceBarChart";

import type { TeamDashboardSummary } from "../../dashboardTypes";

type AssigneePerformanceChartWidgetProps = {
  summary: TeamDashboardSummary;
};

const toPerformanceRows = (
  stats: TeamDashboardSummary["assigneeStats"],
): PerformanceStatRow[] =>
  stats.map((row) => ({
    id: row.userId ?? "unassigned",
    name: row.name,
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

export const AssigneePerformanceChartWidget = ({
  summary,
}: AssigneePerformanceChartWidgetProps) => (
  <PerformanceBarChart
    title="Team performance (chart)"
    description="Bar chart of leads by assignee"
    stats={toPerformanceRows(summary.assigneeStats)}
  />
);
