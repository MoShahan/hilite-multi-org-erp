import { DashboardStatCard } from "./DashboardStatGrid";

import type { ConversionMetrics } from "../dashboardTypes";

const formatWinRate = (winRate: number | null, won: number, lost: number) => {
  if (winRate === null) {
    return { value: "—", description: "No closed leads yet" };
  }

  return {
    value: `${winRate}%`,
    description: `${won} won / ${won + lost} closed`,
  };
};

type ConversionStatCardProps = {
  conversion: ConversionMetrics;
};

export const ConversionStatCard = ({ conversion }: ConversionStatCardProps) => {
  const { value, description } = formatWinRate(
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
