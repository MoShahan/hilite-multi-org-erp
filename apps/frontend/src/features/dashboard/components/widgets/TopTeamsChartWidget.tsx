import {
  PerformanceBarChart,
  type PerformanceStatRow,
} from "../charts/PerformanceBarChart";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopTeamsChartWidgetProps = {
  summary: OrgDashboardSummary;
};

const toPerformanceRows = (
  teams: OrgDashboardSummary["topTeams"],
): PerformanceStatRow[] =>
  teams.map((row) => ({
    id: row.teamId,
    name: row.teamName,
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

export const TopTeamsChartWidget = ({ summary }: TopTeamsChartWidgetProps) => (
  <PerformanceBarChart
    title="Top teams (chart)"
    description="Bar chart of team lead performance"
    stats={toPerformanceRows(summary.topTeams)}
    emptyMessage="No teams with leads yet."
  />
);
