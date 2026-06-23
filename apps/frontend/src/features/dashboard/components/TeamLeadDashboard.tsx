import { AssigneeStatsTable } from "./AssigneeStatsTable";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "./DashboardStatGrid";
import { ConversionStatCard } from "./ConversionStatCard";
import { RecentActivityList } from "./RecentActivityList";
import { StatusBreakdown } from "./StatusBreakdown";

import type { TeamLeadDashboardSummary } from "../dashboardTypes";

type TeamLeadDashboardProps = {
  summary: TeamLeadDashboardSummary;
};

export const TeamLeadDashboard = ({ summary }: TeamLeadDashboardProps) => (
  <div className="space-y-6">
    <DashboardStatGrid>
      <DashboardStatCard
        label="Team leads"
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

    <AssigneeStatsTable stats={summary.assigneeStats} />

    <div className="grid gap-6 xl:grid-cols-2">
      <StatusBreakdown items={summary.statusBreakdown} />
      <RecentActivityList activities={summary.recentActivities} />
    </div>
  </div>
);
