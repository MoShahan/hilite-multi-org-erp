import { formatWinRateDetail } from "@/lib/format";

import { DashboardStatCard } from "./DashboardStatGrid";

import type { ConversionMetrics } from "../dashboardTypes";

type ConversionStatCardProps = {
  conversion: ConversionMetrics;
};

export const ConversionStatCard = ({ conversion }: ConversionStatCardProps) => {
  const { value, description } = formatWinRateDetail(
    conversion.winRate,
    conversion.wonCount,
    conversion.lostCount,
  );

  return (
    <DashboardStatCard
      label="Win rate"
      value={value}
      description={description}
    />
  );
};
