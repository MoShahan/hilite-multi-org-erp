import {
  DashboardStatCard,
  DashboardStatGrid,
} from "../DashboardStatGrid";

import type { DashboardSummaryResponse } from "../../dashboardTypes";

type PipelineStatsWidgetProps = {
  summary: DashboardSummaryResponse;
};

export const PipelineStatsWidget = ({ summary }: PipelineStatsWidgetProps) => {
  if (summary.view === "me") {
    return (
      <DashboardStatGrid>
        <DashboardStatCard
          label="Needs attention"
          value={summary.needsAttentionCount}
          description="New or contacted leads"
        />
        <DashboardStatCard label="Won" value={summary.conversion.wonCount} />
        <DashboardStatCard label="Lost" value={summary.conversion.lostCount} />
        <DashboardStatCard
          label="Closed"
          value={summary.conversion.closedCount}
        />
      </DashboardStatGrid>
    );
  }

  if (summary.view === "team") {
    return (
      <DashboardStatGrid>
        <DashboardStatCard
          label="Open pipeline"
          value={summary.conversion.openLeads}
        />
        <DashboardStatCard label="Won" value={summary.conversion.wonCount} />
        <DashboardStatCard label="Lost" value={summary.conversion.lostCount} />
        <DashboardStatCard
          label="Closed"
          value={summary.conversion.closedCount}
        />
      </DashboardStatGrid>
    );
  }

  return (
    <DashboardStatGrid>
      <DashboardStatCard
        label="Unassigned"
        value={summary.conversion.unassignedCount}
      />
      <DashboardStatCard label="Won" value={summary.conversion.wonCount} />
      <DashboardStatCard label="Lost" value={summary.conversion.lostCount} />
      <DashboardStatCard
        label="Closed"
        value={summary.conversion.closedCount}
      />
    </DashboardStatGrid>
  );
};
