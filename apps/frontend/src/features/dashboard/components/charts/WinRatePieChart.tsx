import { DashboardWidgetCard } from "../DashboardWidgetCard";

import { ModernPieChart } from "./ModernPieChart";
import { WIN_RATE_PIE_CONFIG } from "./pieChartColors";

import type { ConversionMetrics } from "../../dashboardTypes";

type WinRatePieChartProps = {
  conversion: ConversionMetrics;
};

export const WinRatePieChart = ({ conversion }: WinRatePieChartProps) => {
  const { wonCount, lostCount, closedCount, winRate } = conversion;

  if (closedCount === 0) {
    return (
      <DashboardWidgetCard
        title="Win rate"
        description="Closed-lead split between won and lost"
      >
        <p className="text-sm text-muted-foreground">No closed leads yet.</p>
      </DashboardWidgetCard>
    );
  }

  const chartData = [
    {
      key: "won",
      count: wonCount,
    },
    {
      key: "lost",
      count: lostCount,
    },
  ].filter((item) => item.count > 0);

  return (
    <DashboardWidgetCard
      title="Win rate"
      description={`${wonCount} won · ${closedCount} closed`}
    >
      <ModernPieChart
        data={chartData}
        config={WIN_RATE_PIE_CONFIG}
        total={closedCount}
        centerLabel={
          winRate !== null
            ? {
                primary: `${winRate}%`,
                secondary: "Win rate",
              }
            : undefined
        }
      />
    </DashboardWidgetCard>
  );
};
