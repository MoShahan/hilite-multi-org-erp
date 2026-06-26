import {
  PerformanceBarChart,
  toPerformanceRows,
} from "../charts/PerformanceBarChart";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopTeamsChartWidgetProps = {
  summary: OrgDashboardSummary;
};

export const TopTeamsChartWidget = ({ summary }: TopTeamsChartWidgetProps) => (
  <PerformanceBarChart
    title="Top teams (chart)"
    description="Bar chart of team lead performance"
    stats={toPerformanceRows(summary.topTeams)}
    emptyMessage="No teams with leads yet."
  />
);
