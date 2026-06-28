import { useId, useState } from "react";
import { useTheme } from "next-themes";
import { Cell, Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem, PieSectorShapeProps } from "recharts/types/polar/Pie";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { pieGradientStyle, resolvePieGradient } from "./pieChartColors";

type ModernPieDatum = {
  key: string;
  count: number;
  percentage?: number;
};

type DonutCenterLabelProps = {
  primary: string;
  secondary?: string;
};

const DonutCenterLabel = ({ primary, secondary }: DonutCenterLabelProps) => (
  <Label
    content={({ viewBox }) => {
      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
        return null;
      }

      const { cx, cy } = viewBox;

      return (
        <text x={cx} y={cy} textAnchor="middle">
          <tspan
            x={cx}
            dy={secondary ? -6 : 4}
            className="fill-foreground text-3xl font-bold tabular-nums"
          >
            {primary}
          </tspan>
          {secondary ? (
            <tspan
              x={cx}
              dy={28}
              className="fill-muted-foreground text-[11px] font-medium uppercase tracking-wider"
            >
              {secondary}
            </tspan>
          ) : null}
        </text>
      );
    }}
  />
);

const renderActiveShape = (props: PieSectorDataItem) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    cornerRadius,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={(outerRadius as number) + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={cornerRadius}
    />
  );
};

const createPieSectorShape =
  (activeIndex: number | undefined) => (props: PieSectorShapeProps) => {
    const isHighlighted =
      activeIndex === undefined || activeIndex === props.index;
    const isExpanded = activeIndex === props.index;

    if (isExpanded) {
      return renderActiveShape(props);
    }

    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        innerRadius={props.innerRadius}
        outerRadius={props.outerRadius}
        startAngle={props.startAngle}
        endAngle={props.endAngle}
        fill={props.fill}
        cornerRadius={props.cornerRadius}
        opacity={isHighlighted ? 1 : 0.45}
      />
    );
  };

type ModernPieChartProps = {
  data: ModernPieDatum[];
  config: ChartConfig;
  total: number;
  className?: string;
  centerLabel?: DonutCenterLabelProps;
  variant?: "donut" | "pie";
};

export const ModernPieChart = ({
  data,
  config,
  total,
  className,
  centerLabel,
  variant = "donut",
}: ModernPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const gradientPrefix = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";
  const isDonut = variant === "donut";
  const innerRadius = isDonut ? "58%" : "0%";
  const outerRadius = "82%";

  const getPercentage = (count: number, preset?: number) =>
    preset ?? (total === 0 ? 0 : Math.round((count / total) * 100));

  const getGradientId = (key: string) => `pie-grad-${gradientPrefix}-${key}`;

  const getGradientFill = (key: string) => `url(#${getGradientId(key)})`;

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:justify-center",
        className,
      )}
    >
      <ChartContainer
        config={config}
        className="mx-auto aspect-square h-[260px] w-full max-w-[280px] shrink-0 [&_.recharts-sector]:origin-center [&_.recharts-sector]:transition-[transform,opacity] [&_.recharts-sector]:duration-200"
      >
        <PieChart>
          <defs>
            {data.map((entry) => {
              const gradient = resolvePieGradient(entry.key, colorMode);

              return (
                <linearGradient
                  key={entry.key}
                  id={getGradientId(entry.key)}
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
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => {
                  const count = item.payload.count as number;
                  const pct = getPercentage(
                    count,
                    item.payload.percentage as number | undefined,
                  );
                  return `${value} · ${pct}%`;
                }}
              />
            }
          />
          <Pie
            data={[{ value: 1 }]}
            dataKey="value"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="var(--muted)"
            stroke="none"
            isAnimationActive={false}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="key"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={isDonut ? 3 : 1}
            cornerRadius={isDonut ? 8 : 4}
            stroke="var(--background)"
            strokeWidth={2}
            shape={createPieSectorShape(activeIndex)}
            onMouseEnter={(_data, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={getGradientFill(entry.key)} />
            ))}
            {centerLabel ? (
              <DonutCenterLabel
                primary={centerLabel.primary}
                secondary={centerLabel.secondary}
              />
            ) : null}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="grid w-full max-w-sm flex-1 gap-2 lg:max-w-xs">
        {data.map((entry, index) => {
          const pct = getPercentage(entry.count, entry.percentage);
          const itemConfig = config[entry.key];
          const gradient = resolvePieGradient(entry.key, colorMode);

          return (
            <button
              key={entry.key}
              type="button"
              className={cn(
                "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200",
                activeIndex === index
                  ? "border-border/80 bg-muted/60 shadow-sm"
                  : "border-border/40 bg-muted/20 hover:border-border/60 hover:bg-muted/40",
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                  style={{ background: pieGradientStyle(gradient) }}
                />
                <span className="truncate font-medium">
                  {itemConfig?.label ?? entry.key}
                </span>
              </div>
              <div className="ml-3 flex shrink-0 items-baseline gap-2 tabular-nums">
                <span className="text-base font-semibold">{entry.count}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
