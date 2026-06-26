import {
  PerformanceBarChart,
  type PerformanceStatRow,
} from "../charts/PerformanceBarChart";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopExecutivesChartWidgetProps = {
  summary: OrgDashboardSummary;
};

const toPerformanceRows = (
  executives: OrgDashboardSummary["topExecutives"],
): PerformanceStatRow[] =>
  executives.map((row) => ({
    id: row.userId ?? row.name,
    name: row.name,
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

export const TopExecutivesChartWidget = ({
  summary,
}: TopExecutivesChartWidgetProps) => (
  <PerformanceBarChart
    title="Top executives (chart)"
    description="Bar chart of executive lead performance"
    stats={toPerformanceRows(summary.topExecutives)}
    emptyMessage="No executives with leads yet."
  />
);
