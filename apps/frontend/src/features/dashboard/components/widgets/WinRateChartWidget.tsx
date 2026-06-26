import { WinRatePieChart } from "../charts/WinRatePieChart";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type WinRateChartWidgetProps = {
  summary: DashboardSummaryBase;
};

export const WinRateChartWidget = ({ summary }: WinRateChartWidgetProps) => (
  <WinRatePieChart conversion={summary.conversion} />
);
