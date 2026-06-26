import { StatusPieChart } from "../charts/StatusPieChart";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type StatusPieChartWidgetProps = {
  summary: DashboardSummaryBase;
};

export const StatusPieChartWidget = ({ summary }: StatusPieChartWidgetProps) => (
  <StatusPieChart items={summary.statusBreakdown} />
);
