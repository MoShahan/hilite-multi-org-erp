import { Cell, Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { ConversionMetrics } from "../../dashboardTypes";

type WinRatePieChartProps = {
  conversion: ConversionMetrics;
};

const chartConfig = {
  won: {
    label: "Won",
    color: "var(--chart-2)",
  },
  lost: {
    label: "Lost",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const WinRatePieChart = ({ conversion }: WinRatePieChartProps) => {
  const { wonCount, lostCount, closedCount, winRate } = conversion;

  if (closedCount === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Win rate (chart)</CardTitle>
          <CardDescription>Pie chart of won vs lost among closed leads</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No closed leads yet.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      key: "won",
      count: wonCount,
      fill: "var(--color-won)",
    },
    {
      key: "lost",
      count: lostCount,
      fill: "var(--color-lost)",
    },
  ].filter((item) => item.count > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Win rate (chart)</CardTitle>
        <CardDescription>
          {wonCount} won / {closedCount} closed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const pct = Math.round(
                      ((item.payload.count as number) / closedCount) * 100,
                    );
                    return `${value} (${pct}%)`;
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="key"
              innerRadius={60}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
              {winRate !== null ? (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-semibold"
                          >
                            {winRate}%
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              ) : null}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="key" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
