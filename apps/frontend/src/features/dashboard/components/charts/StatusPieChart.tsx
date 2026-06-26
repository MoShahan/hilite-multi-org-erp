import { Cell, Pie, PieChart } from "recharts";

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

import { LEAD_STATUS_LABELS } from "../../dashboardTypes";

import type { StatusBreakdownItem } from "../../dashboardTypes";

type StatusPieChartProps = {
  items: StatusBreakdownItem[];
};

const STATUS_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
];

const buildChartConfig = (items: StatusBreakdownItem[]): ChartConfig =>
  Object.fromEntries(
    items.map((item, index) => [
      item.status,
      {
        label: LEAD_STATUS_LABELS[item.status],
        color: STATUS_CHART_COLORS[index % STATUS_CHART_COLORS.length],
      },
    ]),
  );

export const StatusPieChart = ({ items }: StatusPieChartProps) => {
  if (items.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lead status (chart)</CardTitle>
          <CardDescription>Pie chart of leads by status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = items.map((item) => ({
    status: item.status,
    count: item.count,
    percentage: item.percentage,
    fill: `var(--color-${item.status})`,
  }));

  const chartConfig = buildChartConfig(items);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Lead status (chart)</CardTitle>
        <CardDescription>Pie chart of leads by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) =>
                    `${value} (${item.payload.percentage}%)`
                  }
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={0}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
