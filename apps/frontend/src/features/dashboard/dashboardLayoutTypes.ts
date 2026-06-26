export const DASHBOARD_WIDGET_KEYS = {
  CONVERSION_OVERVIEW: "conversion_overview",
  PIPELINE_STATS: "pipeline_stats",
  ASSIGNEE_LEADERBOARD: "assignee_leaderboard",
  TOP_TEAMS: "top_teams",
  TOP_EXECUTIVES: "top_executives",
  STATUS_BREAKDOWN: "status_breakdown",
  RECENT_ACTIVITIES: "recent_activities",
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
