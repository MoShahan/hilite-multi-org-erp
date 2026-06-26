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

import type { ConversionMetrics } from "../../dashboardTypes";

type ConversionOutcomesChartProps = {
  conversion: ConversionMetrics;
};

const chartConfig = {
  open: {
    label: "Open pipeline",
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

export const ConversionOutcomesChart = ({
  conversion,
}: ConversionOutcomesChartProps) => {
  const chartData = [
    {
      key: "open",
      count: conversion.openLeads,
      fill: "var(--color-open)",
    },
    {
      key: "won",
      count: conversion.wonCount,
      fill: "var(--color-won)",
    },
    {
      key: "lost",
      count: conversion.lostCount,
      fill: "var(--color-lost)",
    },
  ].filter((item) => item.count > 0);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Conversion outcomes (chart)</CardTitle>
          <CardDescription>Donut chart of open, won, and lost leads</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
        </CardContent>
      </Card>
    );
  }

  const total = conversion.totalLeads;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Conversion outcomes (chart)</CardTitle>
        <CardDescription>Donut chart of open, won, and lost leads</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-video max-h-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const pct =
                      total === 0
                        ? 0
                        : Math.round(
                            ((item.payload.count as number) / total) * 100,
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
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="key" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
