import { DashboardWidgetCard } from "../DashboardWidgetCard";

import { ModernPieChart } from "./ModernPieChart";
import { CONVERSION_PIE_CONFIG } from "./pieChartColors";

import type { ConversionMetrics } from "../../dashboardTypes";

type ConversionOutcomesChartProps = {
  conversion: ConversionMetrics;
};

export const ConversionOutcomesChart = ({
  conversion,
}: ConversionOutcomesChartProps) => {
  const chartData = [
    {
      key: "open",
      count: conversion.openLeads,
    },
    {
      key: "won",
      count: conversion.wonCount,
    },
    {
      key: "lost",
      count: conversion.lostCount,
    },
  ].filter((item) => item.count > 0);

  if (chartData.length === 0) {
    return (
      <DashboardWidgetCard
        title="Conversion outcomes"
        description="Pipeline split across open, won, and lost leads"
      >
        <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
      </DashboardWidgetCard>
    );
  }

  const total = conversion.totalLeads;

  return (
    <DashboardWidgetCard
      title="Conversion outcomes"
      description="Pipeline split across open, won, and lost leads"
    >
      <ModernPieChart
        data={chartData}
        config={CONVERSION_PIE_CONFIG}
        total={total}
        centerLabel={{
          primary: String(total),
          secondary: "Total leads",
        }}
      />
    </DashboardWidgetCard>
  );
};
