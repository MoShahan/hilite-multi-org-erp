import { DashboardWidgetCard } from "../DashboardWidgetCard";
import { LEAD_STATUS_LABELS } from "../../dashboardTypes";

import { ModernPieChart } from "./ModernPieChart";
import { buildStatusPieConfig } from "./pieChartColors";

import type { StatusBreakdownItem } from "../../dashboardTypes";

type StatusPieChartProps = {
  items: StatusBreakdownItem[];
};

export const StatusPieChart = ({ items }: StatusPieChartProps) => {
  if (items.length === 0) {
    return (
      <DashboardWidgetCard
        title="Lead status"
        description="Distribution of leads across pipeline stages"
      >
        <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
      </DashboardWidgetCard>
    );
  }

  const total = items.reduce((sum, item) => sum + item.count, 0);

  const chartData = items.map((item) => ({
    key: item.status,
    count: item.count,
    percentage: item.percentage,
  }));

  const chartConfig = buildStatusPieConfig(
    items.map((item) => item.status),
    LEAD_STATUS_LABELS,
  );

  return (
    <DashboardWidgetCard
      title="Lead status"
      description="Distribution of leads across pipeline stages"
    >
      <ModernPieChart
        data={chartData}
        config={chartConfig}
        total={total}
        centerLabel={{
          primary: String(total),
          secondary: "In pipeline",
        }}
      />
    </DashboardWidgetCard>
  );
};
