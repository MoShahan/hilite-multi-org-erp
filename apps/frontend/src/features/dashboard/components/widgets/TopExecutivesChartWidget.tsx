import {
  PerformanceBarChart,
  toPerformanceRows,
} from "../charts/PerformanceBarChart";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopExecutivesChartWidgetProps = {
  summary: OrgDashboardSummary;
};

export const TopExecutivesChartWidget = ({
  summary,
}: TopExecutivesChartWidgetProps) => (
  <PerformanceBarChart
    title="Top executives (chart)"
    description="Bar chart of executive lead performance"
    stats={toPerformanceRows(summary.topExecutives)}
    emptyMessage="No assigned leads in the organization yet."
  />
);
