import {
  DashboardStatCard,
  DashboardStatGrid,
} from "./DashboardStatGrid";
import { ConversionStatCard } from "./ConversionStatCard";
import { RecentActivityList } from "./RecentActivityList";
import { StatusBreakdown } from "./StatusBreakdown";

import type { ExecutiveDashboardSummary } from "../dashboardTypes";

type ExecutiveDashboardProps = {
  summary: ExecutiveDashboardSummary;
};

export const ExecutiveDashboard = ({ summary }: ExecutiveDashboardProps) => (
  <div className="space-y-6">
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

    <DashboardStatGrid>
      <DashboardStatCard
        label="Needs attention"
        value={summary.needsAttentionCount}
        description="New or contacted leads"
      />
      <DashboardStatCard
        label="Won"
        value={summary.conversion.wonCount}
      />
      <DashboardStatCard
        label="Lost"
        value={summary.conversion.lostCount}
      />
      <DashboardStatCard
        label="Unassigned"
        value={summary.conversion.unassignedCount}
        description="Should be 0 for executives"
      />
    </DashboardStatGrid>

    <div className="grid gap-6 xl:grid-cols-2">
      <StatusBreakdown items={summary.statusBreakdown} />
      <RecentActivityList activities={summary.recentActivities} />
    </div>
  </div>
);
