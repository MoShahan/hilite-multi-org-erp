import {
  DashboardStatCard,
  DashboardStatGrid,
} from "./DashboardStatGrid";
import { ConversionStatCard } from "./ConversionStatCard";
import { RecentActivityList } from "./RecentActivityList";
import { StatusBreakdown } from "./StatusBreakdown";
import { TopExecutivesTable } from "./TopExecutivesTable";
import { TopTeamsTable } from "./TopTeamsTable";

import type { DirectorDashboardSummary } from "../dashboardTypes";

type DirectorDashboardProps = {
  summary: DirectorDashboardSummary;
};

export const DirectorDashboard = ({ summary }: DirectorDashboardProps) => (
  <div className="space-y-6">
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

    <div className="grid gap-6 xl:grid-cols-2">
      <TopTeamsTable teams={summary.topTeams} />
      <TopExecutivesTable executives={summary.topExecutives} />
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <StatusBreakdown items={summary.statusBreakdown} />
      <RecentActivityList activities={summary.recentActivities} />
    </div>
  </div>
);
