import type { DashboardView } from "../services/dashboardAccess.service";

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

const widget = (
  key: DashboardWidgetKey,
  label: string,
  description: string,
  width: DashboardWidgetWidth = "full",
): DashboardWidgetDefinition => ({
  key,
  label,
  description,
  width,
});

const ME_WIDGETS: DashboardWidgetDefinition[] = [
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
    "Conversion overview",
    "Assigned leads, open pipeline, conversion rate, and activities",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_CHART,
    "Conversion outcomes (chart)",
    "Donut chart of open, won, and lost leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.WIN_RATE_CHART,
    "Win rate (chart)",
    "Pie chart of won vs lost among closed leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
    "Pipeline stats",
    "Needs attention, won, lost, and closed counts",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
    "Lead status",
    "Distribution of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_PIE_CHART,
    "Lead status (chart)",
    "Pie chart of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
    "Recent activities",
    "Latest interactions on your leads",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES_TABLE,
    "Recent activities (table)",
    "Tabular view of latest interactions",
    "half",
  ),
];

const TEAM_WIDGETS: DashboardWidgetDefinition[] = [
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
    "Conversion overview",
    "Leads in team, unassigned count, conversion rate, and activities",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_CHART,
    "Conversion outcomes (chart)",
    "Donut chart of open, won, and lost leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.WIN_RATE_CHART,
    "Win rate (chart)",
    "Pie chart of won vs lost among closed leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
    "Pipeline stats",
    "Open pipeline, won, lost, and closed counts",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.ASSIGNEE_LEADERBOARD,
    "Team leaderboard",
    "Lead counts and win rates by assignee",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.ASSIGNEE_PERFORMANCE_CHART,
    "Team performance (chart)",
    "Bar chart of leads by assignee",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
    "Lead status",
    "Distribution of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_PIE_CHART,
    "Lead status (chart)",
    "Pie chart of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
    "Recent activities",
    "Latest interactions on leads in team",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES_TABLE,
    "Recent activities (table)",
    "Tabular view of latest interactions",
    "half",
  ),
];

const ORG_WIDGETS: DashboardWidgetDefinition[] = [
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
    "Conversion overview",
    "Organization leads, open pipeline, conversion rate, and activities",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.CONVERSION_CHART,
    "Conversion outcomes (chart)",
    "Donut chart of open, won, and lost leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.WIN_RATE_CHART,
    "Win rate (chart)",
    "Pie chart of won vs lost among closed leads",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
    "Pipeline stats",
    "Unassigned, won, lost, and closed counts",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.TOP_TEAMS,
    "Top teams",
    "Lead performance by team",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.TOP_TEAMS_CHART,
    "Top teams (chart)",
    "Bar chart of team lead performance",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.TOP_EXECUTIVES,
    "Top executives",
    "Lead performance by assignee",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.TOP_EXECUTIVES_CHART,
    "Top executives (chart)",
    "Bar chart of executive lead performance",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
    "Lead status",
    "Distribution of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.STATUS_PIE_CHART,
    "Lead status (chart)",
    "Pie chart of leads by status",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
    "Recent activities",
    "Latest interactions across the organization",
    "half",
  ),
  widget(
    DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES_TABLE,
    "Recent activities (table)",
    "Tabular view of latest interactions",
    "half",
  ),
];

export const DASHBOARD_WIDGET_CATALOG: Record<
  DashboardView,
  DashboardWidgetDefinition[]
> = {
  me: ME_WIDGETS,
  team: TEAM_WIDGETS,
  org: ORG_WIDGETS,
};

const toDefaultLayout = (
  catalog: DashboardWidgetDefinition[],
): DashboardLayoutItem[] =>
  catalog.map((item, order) => ({
    key: item.key,
    order,
    visible: true,
  }));

export const DEFAULT_DASHBOARD_LAYOUTS: Record<
  DashboardView,
  DashboardLayoutItem[]
> = {
  me: toDefaultLayout(ME_WIDGETS),
  team: toDefaultLayout(TEAM_WIDGETS),
  org: toDefaultLayout(ORG_WIDGETS),
};

export const getWidgetCatalogForView = (
  view: DashboardView,
): DashboardWidgetDefinition[] => DASHBOARD_WIDGET_CATALOG[view];

export const getDefaultLayoutForView = (
  view: DashboardView,
): DashboardLayoutItem[] =>
  DEFAULT_DASHBOARD_LAYOUTS[view].map((item) => ({ ...item }));

export const isValidWidgetKeyForView = (
  view: DashboardView,
  key: string,
): key is DashboardWidgetKey =>
  DASHBOARD_WIDGET_CATALOG[view].some((widget) => widget.key === key);
