export const DASHBOARD_WIDGET_KEYS = {
  CONVERSION_OVERVIEW: "conversion_overview",
  CONVERSION_CHART: "conversion_chart",
  WIN_RATE_CHART: "win_rate_chart",
  PIPELINE_STATS: "pipeline_stats",
  ASSIGNEE_LEADERBOARD: "assignee_leaderboard",
  ASSIGNEE_PERFORMANCE_CHART: "assignee_performance_chart",
  TOP_TEAMS: "top_teams",
  TOP_TEAMS_CHART: "top_teams_chart",
  TOP_EXECUTIVES: "top_executives",
  TOP_EXECUTIVES_CHART: "top_executives_chart",
  STATUS_BREAKDOWN: "status_breakdown",
  STATUS_PIE_CHART: "status_pie_chart",
  RECENT_ACTIVITIES: "recent_activities",
  RECENT_ACTIVITIES_TABLE: "recent_activities_table",
} as const;

export type DashboardWidgetKey =
  (typeof DASHBOARD_WIDGET_KEYS)[keyof typeof DASHBOARD_WIDGET_KEYS];

export type DashboardWidgetWidth = "full" | "half";

export type DashboardView = "me" | "team" | "org";

export type DashboardWidgetDefinition = {
  key: DashboardWidgetKey;
  label: string;
  description: string;
  width: DashboardWidgetWidth;
};

export type DashboardLayoutItem = {
  key: DashboardWidgetKey;
  order: number;
  visible: boolean;
};

export type DashboardLayoutResponse = {
  view: DashboardView;
  widgets: DashboardLayoutItem[];
  catalog: DashboardWidgetDefinition[];
};

export type UpdateDashboardLayoutInput = {
  widgets: DashboardLayoutItem[];
};
