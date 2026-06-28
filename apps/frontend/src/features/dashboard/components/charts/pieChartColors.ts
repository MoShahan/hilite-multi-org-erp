import type { LeadStatus } from "@/features/leads/leadsTypes";

import type { ChartConfig } from "@/components/ui/chart";

export type PieGradientStop = {
  start: string;
  end: string;
};

export type PieGradientTheme = {
  light: PieGradientStop;
  dark: PieGradientStop;
};

type ThemeColors = {
  light: string;
  dark: string;
};

const themed = (light: string, dark: string): ThemeColors => ({ light, dark });

const warmGradient = (
  light: PieGradientStop,
  dark: PieGradientStop,
): PieGradientTheme => ({ light, dark });

const toChartEntry = (label: string, colors: ThemeColors) => ({
  label,
  theme: colors,
});

/** Saturated warm tone → soft faded warm tone (reference-style gradient). */
const PIE_GRADIENTS = {
  open: warmGradient(
    { start: "oklch(0.64 0.19 58)", end: "oklch(0.88 0.11 72)" },
    { start: "oklch(0.72 0.17 58)", end: "oklch(0.78 0.10 68)" },
  ),
  won: warmGradient(
    { start: "oklch(0.62 0.17 85)", end: "oklch(0.90 0.09 95)" },
    { start: "oklch(0.70 0.15 85)", end: "oklch(0.80 0.08 92)" },
  ),
  lost: warmGradient(
    { start: "oklch(0.58 0.20 32)", end: "oklch(0.86 0.10 48)" },
    { start: "oklch(0.66 0.18 32)", end: "oklch(0.76 0.09 42)" },
  ),
  NEW: warmGradient(
    { start: "oklch(0.66 0.18 52)", end: "oklch(0.89 0.11 68)" },
    { start: "oklch(0.74 0.16 52)", end: "oklch(0.79 0.09 62)" },
  ),
  CONTACTED: warmGradient(
    { start: "oklch(0.64 0.20 45)", end: "oklch(0.88 0.12 62)" },
    { start: "oklch(0.72 0.18 45)", end: "oklch(0.78 0.10 58)" },
  ),
  VISIT_SCHEDULED: warmGradient(
    { start: "oklch(0.62 0.19 38)", end: "oklch(0.87 0.11 55)" },
    { start: "oklch(0.70 0.17 38)", end: "oklch(0.77 0.09 50)" },
  ),
  SITE_VISIT_COMPLETED: warmGradient(
    { start: "oklch(0.63 0.16 78)", end: "oklch(0.90 0.09 90)" },
    { start: "oklch(0.71 0.14 78)", end: "oklch(0.80 0.08 86)" },
  ),
  NEGOTIATION: warmGradient(
    { start: "oklch(0.60 0.21 42)", end: "oklch(0.86 0.12 58)" },
    { start: "oklch(0.68 0.19 42)", end: "oklch(0.76 0.10 52)" },
  ),
  WON: warmGradient(
    { start: "oklch(0.62 0.17 85)", end: "oklch(0.90 0.09 95)" },
    { start: "oklch(0.70 0.15 85)", end: "oklch(0.80 0.08 92)" },
  ),
  LOST: warmGradient(
    { start: "oklch(0.58 0.20 32)", end: "oklch(0.86 0.10 48)" },
    { start: "oklch(0.66 0.18 32)", end: "oklch(0.76 0.09 42)" },
  ),
} as const satisfies Record<string, PieGradientTheme>;

export const resolvePieGradient = (
  key: string,
  mode: "light" | "dark",
): PieGradientStop =>
  PIE_GRADIENTS[key as keyof typeof PIE_GRADIENTS]?.[mode] ?? {
    start: mode === "light" ? "oklch(0.64 0.18 55)" : "oklch(0.72 0.16 55)",
    end: mode === "light" ? "oklch(0.88 0.10 70)" : "oklch(0.78 0.09 65)",
  };

export const CONVERSION_PIE_CONFIG = {
  open: toChartEntry(
    "Open pipeline",
    themed(PIE_GRADIENTS.open.light.start, PIE_GRADIENTS.open.dark.start),
  ),
  won: toChartEntry(
    "Won",
    themed(PIE_GRADIENTS.won.light.start, PIE_GRADIENTS.won.dark.start),
  ),
  lost: toChartEntry(
    "Lost",
    themed(PIE_GRADIENTS.lost.light.start, PIE_GRADIENTS.lost.dark.start),
  ),
} satisfies ChartConfig;

export const WIN_RATE_PIE_CONFIG = {
  won: toChartEntry(
    "Won",
    themed(PIE_GRADIENTS.won.light.start, PIE_GRADIENTS.won.dark.start),
  ),
  lost: toChartEntry(
    "Lost",
    themed(PIE_GRADIENTS.lost.light.start, PIE_GRADIENTS.lost.dark.start),
  ),
} satisfies ChartConfig;

export const buildStatusPieConfig = (
  statuses: LeadStatus[],
  labels: Record<LeadStatus, string>,
): ChartConfig =>
  Object.fromEntries(
    statuses.map((status) => [
      status,
      toChartEntry(
        labels[status],
        themed(
          PIE_GRADIENTS[status].light.start,
          PIE_GRADIENTS[status].dark.start,
        ),
      ),
    ]),
  );

export const pieGradientStyle = (gradient: PieGradientStop) =>
  `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`;

export const barGradientStyle = (gradient: PieGradientStop) =>
  `linear-gradient(180deg, ${gradient.start} 0%, ${gradient.end} 72%)`;

export type PerformanceBarMetric = "total" | "won" | "lost";

const BAR_METRIC_LABELS: Record<PerformanceBarMetric, string> = {
  total: "Total",
  won: "Won",
  lost: "Lost",
};

export const resolveBarGradient = (
  metric: PerformanceBarMetric,
  mode: "light" | "dark",
): PieGradientStop => {
  if (metric === "total") {
    return resolvePieGradient("open", mode);
  }

  return resolvePieGradient(metric, mode);
};

export const PERFORMANCE_BAR_CONFIG = {
  total: toChartEntry(
    BAR_METRIC_LABELS.total,
    themed(PIE_GRADIENTS.open.light.start, PIE_GRADIENTS.open.dark.start),
  ),
  won: toChartEntry(
    BAR_METRIC_LABELS.won,
    themed(PIE_GRADIENTS.won.light.start, PIE_GRADIENTS.won.dark.start),
  ),
  lost: toChartEntry(
    BAR_METRIC_LABELS.lost,
    themed(PIE_GRADIENTS.lost.light.start, PIE_GRADIENTS.lost.dark.start),
  ),
} satisfies ChartConfig;

export const PERFORMANCE_BAR_METRICS: PerformanceBarMetric[] = [
  "total",
  "won",
  "lost",
];
