import type { ReactNode } from "react";

import { DASHBOARD_WIDGET_KEYS, type DashboardWidgetKey } from "../../dashboardLayoutTypes";
import type { DashboardSummaryResponse } from "../../dashboardTypes";
import { AssigneeLeaderboardWidget } from "./AssigneeLeaderboardWidget";
import { ConversionOverviewWidget } from "./ConversionOverviewWidget";
import { PipelineStatsWidget } from "./PipelineStatsWidget";
import { RecentActivitiesWidget } from "./RecentActivitiesWidget";
import { StatusBreakdownWidget } from "./StatusBreakdownWidget";
import { TopExecutivesWidget } from "./TopExecutivesWidget";
import { TopTeamsWidget } from "./TopTeamsWidget";

export const renderDashboardWidget = (
  key: DashboardWidgetKey,
  summary: DashboardSummaryResponse,
): ReactNode => {
  switch (key) {
    case DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW:
      return <ConversionOverviewWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.PIPELINE_STATS:
      return <PipelineStatsWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.ASSIGNEE_LEADERBOARD:
      return summary.view === "team" ? (
        <AssigneeLeaderboardWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_TEAMS:
      return summary.view === "org" ? (
        <TopTeamsWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_EXECUTIVES:
      return summary.view === "org" ? (
        <TopExecutivesWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN:
      return <StatusBreakdownWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES:
      return <RecentActivitiesWidget summary={summary} />;
    default:
      return null;
  }
};
