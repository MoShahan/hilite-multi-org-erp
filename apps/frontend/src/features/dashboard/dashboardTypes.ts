import type { ActivityType, LeadStatus } from "@/features/leads/leadsTypes";

export type ConversionMetrics = {
  totalLeads: number;
  openLeads: number;
  wonCount: number;
  lostCount: number;
  closedCount: number;
  winRate: number | null;
  unassignedCount: number;
};

export type StatusBreakdownItem = {
  status: LeadStatus;
  count: number;
  percentage: number;
};

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  notes: string;
  leadId: string;
  leadName: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
};

export type AssigneeLeadStats = {
  userId: string | null;
  name: string;
  total: number;
  won: number;
  lost: number;
  winRate: number | null;
};

export type TeamLeadStats = {
  teamId: string;
  teamName: string;
  total: number;
  won: number;
  lost: number;
  winRate: number | null;
};

export type DashboardSummaryBase = {
  conversion: ConversionMetrics;
  statusBreakdown: StatusBreakdownItem[];
  totalActivities: number;
  recentActivities: RecentActivityItem[];
};

export type ExecutiveDashboardSummary = DashboardSummaryBase & {
  view: "executive";
  needsAttentionCount: number;
};

export type TeamLeadDashboardSummary = DashboardSummaryBase & {
  view: "team_lead";
  assigneeStats: AssigneeLeadStats[];
};

export type DirectorDashboardSummary = DashboardSummaryBase & {
  view: "director";
  topTeams: TeamLeadStats[];
  topExecutives: AssigneeLeadStats[];
};

export type DashboardSummaryResponse =
  | ExecutiveDashboardSummary
  | TeamLeadDashboardSummary
  | DirectorDashboardSummary;

export { LEAD_STATUS_LABELS } from "@/features/leads/leadStatusPipeline";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  OFFLINE_MEETING: "Offline meeting",
  NOTE: "Note",
  ONLINE_MEETING: "Online meeting",
  SITE_VISIT: "Site visit",
  MESSAGE: "Message",
};
