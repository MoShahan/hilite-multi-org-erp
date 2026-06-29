import { useTheme } from "next-themes";
import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { DashboardWidgetCard } from "../DashboardWidgetCard";

import {
  PERFORMANCE_BAR_CONFIG,
  PERFORMANCE_BAR_METRICS,
  barGradientStyle,
  resolveBarGradient,
  type PerformanceBarMetric,
} from "./pieChartColors";

export type PerformanceStatRow = {
  id: string;
  name: string;
  total: number;
  won: number;
  lost: number;
  winRate?: number | null;
};

export const toPerformanceRows = (
  rows: Array<{
    userId?: string | null;
    teamId?: string;
    name?: string;
    teamName?: string;
    total: number;
    won: number;
    lost: number;
  }>,
): PerformanceStatRow[] =>
  rows.map((row) => ({
    id: row.teamId ?? row.userId ?? "unassigned",
    name: row.teamName ?? row.name ?? "Unknown",
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

type PerformanceBarChartProps = {
  title: string;
  description: string;
  stats: PerformanceStatRow[];
  emptyMessage?: string;
};

const BAR_RADIUS = 8;

export const PerformanceBarChart = ({
  title,
  description,
  stats,
  emptyMessage = "No leads in scope yet.",
}: PerformanceBarChartProps) => {
  const gradientPrefix = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";
  const [activeMetric, setActiveMetric] = useState<
    PerformanceBarMetric | undefined
  >(undefined);

  if (stats.length === 0) {
    return (
      <DashboardWidgetCard title={title} description={description}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </DashboardWidgetCard>
    );
  }

  const chartData = stats.map((row) => ({
    name: row.name,
    total: row.total,
    won: row.won,
    lost: row.lost,
  }));

  const getGradientId = (metric: PerformanceBarMetric) =>
    `bar-grad-${gradientPrefix}-${metric}`;

  const getGradientFill = (metric: PerformanceBarMetric) =>
    `url(#${getGradientId(metric)})`;

  const isMetricDimmed = (metric: PerformanceBarMetric) =>
    activeMetric !== undefined && activeMetric !== metric;

  return (
    <DashboardWidgetCard title={title} description={description}>
      <div className="space-y-4">
        <ChartContainer
          config={PERFORMANCE_BAR_CONFIG}
          className="aspect-video max-h-[340px] w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-border/40 [&_.recharts-cartesian-grid-horizontal_line:last-child]:stroke-transparent"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 8,
              right: 12,
              left: 4,
              bottom: stats.length > 4 ? 8 : 0,
            }}
            barCategoryGap="22%"
            barGap={6}
          >
            <defs>
              {PERFORMANCE_BAR_METRICS.map((metric) => {
                const gradient = resolveBarGradient(metric, colorMode);

                return (
                  <linearGradient
                    key={metric}
                    id={getGradientId(metric)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor={gradient.start} />
                    <stop
                      offset="100%"
                      stopColor={gradient.end}
                      stopOpacity={0.72}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 6" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              angle={stats.length > 4 ? -25 : 0}
              textAnchor={stats.length > 4 ? "end" : "middle"}
              height={stats.length > 4 ? 64 : 36}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickMargin={8}
              width={32}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35, radius: 8 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {PERFORMANCE_BAR_METRICS.map((metric) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={getGradientFill(metric)}
                radius={BAR_RADIUS}
                maxBarSize={36}
                opacity={isMetricDimmed(metric) ? 0.35 : 1}
                activeBar={{
                  fill: getGradientFill(metric),
                  radius: 8,
                  opacity: 1,
                }}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`${metric}-${index}`}
                    fill={getGradientFill(metric)}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {PERFORMANCE_BAR_METRICS.map((metric) => {
            const gradient = resolveBarGradient(metric, colorMode);
            const label = PERFORMANCE_BAR_CONFIG[metric].label;

            return (
              <button
                key={metric}
                type="button"
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all duration-200",
                  activeMetric === metric
                    ? "border-border/80 bg-muted/60 shadow-sm"
                    : "border-border/40 bg-muted/20 hover:border-border/60 hover:bg-muted/40",
                )}
                onMouseEnter={() => setActiveMetric(metric)}
                onMouseLeave={() => setActiveMetric(undefined)}
              >
                <span
                  className="h-2.5 w-8 shrink-0 rounded-full"
                  style={{ background: barGradientStyle(gradient) }}
                />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardWidgetCard>
  );
};
