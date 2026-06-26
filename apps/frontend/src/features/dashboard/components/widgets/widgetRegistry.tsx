import type { ReactNode } from "react";

import { DASHBOARD_WIDGET_KEYS, type DashboardWidgetKey } from "../../dashboardLayoutTypes";
import type { DashboardSummaryResponse } from "../../dashboardTypes";
import { AssigneeLeaderboardWidget } from "./AssigneeLeaderboardWidget";
import { AssigneePerformanceChartWidget } from "./AssigneePerformanceChartWidget";
import { ConversionChartWidget } from "./ConversionChartWidget";
import { ConversionOverviewWidget } from "./ConversionOverviewWidget";
import { PipelineStatsWidget } from "./PipelineStatsWidget";
import { RecentActivitiesTableWidget } from "./RecentActivitiesTableWidget";
import { RecentActivitiesWidget } from "./RecentActivitiesWidget";
import { StatusBreakdownWidget } from "./StatusBreakdownWidget";
import { StatusPieChartWidget } from "./StatusPieChartWidget";
import { TopExecutivesChartWidget } from "./TopExecutivesChartWidget";
import { TopExecutivesWidget } from "./TopExecutivesWidget";
import { TopTeamsChartWidget } from "./TopTeamsChartWidget";
import { TopTeamsWidget } from "./TopTeamsWidget";
import { WinRateChartWidget } from "./WinRateChartWidget";

export const renderDashboardWidget = (
  key: DashboardWidgetKey,
  summary: DashboardSummaryResponse,
): ReactNode => {
  switch (key) {
    case DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW:
      return <ConversionOverviewWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.CONVERSION_CHART:
      return <ConversionChartWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.WIN_RATE_CHART:
      return <WinRateChartWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.PIPELINE_STATS:
      return <PipelineStatsWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.ASSIGNEE_LEADERBOARD:
      return summary.view === "team" ? (
        <AssigneeLeaderboardWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.ASSIGNEE_PERFORMANCE_CHART:
      return summary.view === "team" ? (
        <AssigneePerformanceChartWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_TEAMS:
      return summary.view === "org" ? (
        <TopTeamsWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_TEAMS_CHART:
      return summary.view === "org" ? (
        <TopTeamsChartWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_EXECUTIVES:
      return summary.view === "org" ? (
        <TopExecutivesWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.TOP_EXECUTIVES_CHART:
      return summary.view === "org" ? (
        <TopExecutivesChartWidget summary={summary} />
      ) : null;
    case DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN:
      return <StatusBreakdownWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.STATUS_PIE_CHART:
      return <StatusPieChartWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES:
      return <RecentActivitiesWidget summary={summary} />;
    case DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES_TABLE:
      return <RecentActivitiesTableWidget summary={summary} />;
    default:
      return null;
  }
};
