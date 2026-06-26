import { ConversionOutcomesChart } from "../charts/ConversionOutcomesChart";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type ConversionChartWidgetProps = {
  summary: DashboardSummaryBase;
};

export const ConversionChartWidget = ({ summary }: ConversionChartWidgetProps) => (
  <ConversionOutcomesChart conversion={summary.conversion} />
);
