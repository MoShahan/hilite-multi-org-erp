import { StatusBreakdown } from "../StatusBreakdown";

import type { DashboardSummaryBase } from "../../dashboardTypes";

type StatusBreakdownWidgetProps = {
  summary: DashboardSummaryBase;
};

export const StatusBreakdownWidget = ({
  summary,
}: StatusBreakdownWidgetProps) => (
  <StatusBreakdown items={summary.statusBreakdown} />
);
