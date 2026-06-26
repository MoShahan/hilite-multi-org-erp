import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export type PerformanceStatRow = {
  id: string;
  name: string;
  total: number;
  won: number;
  lost: number;
};

type PerformanceBarChartProps = {
  title: string;
  description: string;
  stats: PerformanceStatRow[];
  emptyMessage?: string;
};

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
  won: {
    label: "Won",
    color: "var(--chart-2)",
  },
  lost: {
    label: "Lost",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const PerformanceBarChart = ({
  title,
  description,
  stats,
  emptyMessage = "No leads in scope yet.",
}: PerformanceBarChartProps) => {
  if (stats.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = stats.map((row) => ({
    name: row.name,
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video max-h-[320px] w-full">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              angle={stats.length > 4 ? -25 : 0}
              textAnchor={stats.length > 4 ? "end" : "middle"}
              height={stats.length > 4 ? 60 : 30}
            />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            <Bar dataKey="won" fill="var(--color-won)" radius={4} />
            <Bar dataKey="lost" fill="var(--color-lost)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
