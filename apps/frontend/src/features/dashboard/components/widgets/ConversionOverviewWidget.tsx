import { ConversionStatCard } from "../ConversionStatCard";
import { DashboardStatCard, DashboardStatGrid } from "../DashboardStatGrid";

import type { DashboardSummaryResponse } from "../../dashboardTypes";

type ConversionOverviewWidgetProps = {
  summary: DashboardSummaryResponse;
};

export const ConversionOverviewWidget = ({
  summary,
}: ConversionOverviewWidgetProps) => {
  if (summary.view === "me") {
    return (
      <DashboardStatGrid>
        <DashboardStatCard
          label="Assigned leads"
          value={summary.conversion.totalLeads}
        />
        <DashboardStatCard
          label="Open pipeline"
          value={summary.conversion.openLeads}
        />
        <ConversionStatCard conversion={summary.conversion} />
        <DashboardStatCard
          label="Activities"
          value={summary.totalActivities}
          description="Logged on your leads"
        />
      </DashboardStatGrid>
    );
  }

  if (summary.view === "team") {
    return (
      <DashboardStatGrid>
        <DashboardStatCard
          label="Leads in team"
          value={summary.conversion.totalLeads}
        />
        <DashboardStatCard
          label="Unassigned"
          value={summary.conversion.unassignedCount}
        />
        <ConversionStatCard conversion={summary.conversion} />
        <DashboardStatCard
          label="Team activities"
          value={summary.totalActivities}
        />
      </DashboardStatGrid>
    );
  }

  return (
    <DashboardStatGrid>
      <DashboardStatCard
        label="Organization leads"
        value={summary.conversion.totalLeads}
      />
      <DashboardStatCard
        label="Open pipeline"
        value={summary.conversion.openLeads}
      />
      <ConversionStatCard conversion={summary.conversion} />
      <DashboardStatCard
        label="Organization activities"
        value={summary.totalActivities}
      />
    </DashboardStatGrid>
  );
};
