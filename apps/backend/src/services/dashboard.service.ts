import { LeadStatus } from "../generated/prisma/client";
import { dashboardRepository } from "../repositories/dashboard.repository";
import type {
  AssigneeLeadStats,
  ConversionMetrics,
  DashboardSummaryResponse,
  MeDashboardSummary,
  OrgDashboardSummary,
  RecentActivityItem,
  StatusBreakdownItem,
  TeamDashboardSummary,
  TeamLeadStats,
} from "../types/dashboard";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";
import {
  isClosedStatus,
  isNeedsAttentionStatus,
  resolveDashboardLeadScope,
  resolveDashboardView,
} from "./dashboardAccess.service";

const ALL_STATUSES = Object.values(LeadStatus);

const computeWinRate = (won: number, lost: number): number | null => {
  const closed = won + lost;
  if (closed === 0) {
    return null;
  }

  return Math.round((won / closed) * 100);
};

const buildStatusBreakdown = (
  statusGroups: { status: LeadStatus; _count: { _all: number } }[],
  totalLeads: number,
): StatusBreakdownItem[] => {
  const countByStatus = new Map(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  return ALL_STATUSES.map((status) => {
    const count = countByStatus.get(status) ?? 0;
    return {
      status,
      count,
      percentage:
        totalLeads === 0 ? 0 : Math.round((count / totalLeads) * 100),
    };
  }).filter((item) => item.count > 0);
};

const buildConversionMetrics = (
  statusGroups: { status: LeadStatus; _count: { _all: number } }[],
  totalLeads: number,
  unassignedCount: number,
): ConversionMetrics => {
  const countByStatus = new Map(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  const wonCount = countByStatus.get(LeadStatus.WON) ?? 0;
  const lostCount = countByStatus.get(LeadStatus.LOST) ?? 0;
  const closedCount = wonCount + lostCount;
  const openLeads = totalLeads - closedCount;

  return {
    totalLeads,
    openLeads,
    wonCount,
    lostCount,
    closedCount,
    winRate: computeWinRate(wonCount, lostCount),
    unassignedCount,
  };
};

const truncateNotes = (notes: string, maxLength = 120) => {
  if (notes.length <= maxLength) {
    return notes;
  }

  return `${notes.slice(0, maxLength).trimEnd()}…`;
};

const toRecentActivities = (
  activities: Awaited<
    ReturnType<typeof dashboardRepository.findRecentActivities>
  >,
): RecentActivityItem[] =>
  activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    notes: truncateNotes(activity.notes),
    leadId: activity.lead.id,
    leadName: activity.lead.name,
    createdBy: activity.createdBy,
    createdAt: activity.createdAt.toISOString(),
  }));

type AssigneeAggregate = {
  userId: string | null;
  total: number;
  won: number;
  lost: number;
};

const aggregateByAssignee = (
  groups: Awaited<
    ReturnType<typeof dashboardRepository.groupLeadsByAssigneeAndStatus>
  >,
): AssigneeAggregate[] => {
  const map = new Map<string | null, AssigneeAggregate>();

  for (const group of groups) {
    const key = group.assignedToId;
    const existing = map.get(key) ?? {
      userId: key,
      total: 0,
      won: 0,
      lost: 0,
    };

    existing.total += group._count._all;
    if (group.status === LeadStatus.WON) {
      existing.won += group._count._all;
    }
    if (group.status === LeadStatus.LOST) {
      existing.lost += group._count._all;
    }

    map.set(key, existing);
  }

  return [...map.values()];
};

const aggregateByTeam = (
  groups: Awaited<
    ReturnType<typeof dashboardRepository.groupLeadsByTeamAndStatus>
  >,
): Map<string, { teamId: string; total: number; won: number; lost: number }> => {
  const map = new Map<
    string,
    { teamId: string; total: number; won: number; lost: number }
  >();

  for (const group of groups) {
    const existing = map.get(group.teamId) ?? {
      teamId: group.teamId,
      total: 0,
      won: 0,
      lost: 0,
    };

    existing.total += group._count._all;
    if (group.status === LeadStatus.WON) {
      existing.won += group._count._all;
    }
    if (group.status === LeadStatus.LOST) {
      existing.lost += group._count._all;
    }

    map.set(group.teamId, existing);
  }

  return map;
};

const buildAssigneeStats = async (
  aggregates: AssigneeAggregate[],
  includeUnassigned: boolean,
): Promise<AssigneeLeadStats[]> => {
  const userIds = aggregates
    .map((item) => item.userId)
    .filter((id): id is string => id !== null);

  const users = await dashboardRepository.findUsersByIds(userIds);
  const userNameById = new Map(users.map((user) => [user.id, user.name]));

  const stats = aggregates
    .filter((item) => includeUnassigned || item.userId !== null)
    .map((item) => ({
      userId: item.userId,
      name:
        item.userId === null
          ? "Unassigned"
          : (userNameById.get(item.userId) ?? "Unknown"),
      total: item.total,
      won: item.won,
      lost: item.lost,
      winRate: computeWinRate(item.won, item.lost),
    }))
    .sort((a, b) => b.total - a.total);

  return stats;
};

const buildTeamStats = async (
  teamAggregates: Map<
    string,
    { teamId: string; total: number; won: number; lost: number }
  >,
): Promise<TeamLeadStats[]> => {
  const teamIds = [...teamAggregates.keys()];
  const teams = await dashboardRepository.findTeamsByIds(teamIds);
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));

  return [...teamAggregates.values()]
    .map((item) => ({
      teamId: item.teamId,
      teamName: teamNameById.get(item.teamId) ?? "Unknown",
      total: item.total,
      won: item.won,
      lost: item.lost,
      winRate: computeWinRate(item.won, item.lost),
    }))
    .sort((a, b) => b.total - a.total);
};

const requireOrganizationId = (organizationId: string | null | undefined) => {
  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};

export const dashboardService = {
  getSummary: async (
    organizationId: string | null,
    authUser: AuthUser,
  ): Promise<DashboardSummaryResponse> => {
    const orgId = requireOrganizationId(organizationId);
    const view = resolveDashboardView(authUser);
    const leadScope = resolveDashboardLeadScope(authUser, orgId, view);

    const [
      totalLeads,
      unassignedCount,
      statusGroups,
      totalActivities,
      recentActivities,
    ] = await Promise.all([
      dashboardRepository.countLeads(leadScope),
      dashboardRepository.countUnassignedLeads(leadScope),
      dashboardRepository.groupLeadsByStatus(leadScope),
      dashboardRepository.countActivities(leadScope),
      dashboardRepository.findRecentActivities(leadScope),
    ]);

    const conversion = buildConversionMetrics(
      statusGroups,
      totalLeads,
      unassignedCount,
    );
    const statusBreakdown = buildStatusBreakdown(statusGroups, totalLeads);
    const recentActivityItems = toRecentActivities(recentActivities);

    const base = {
      conversion,
      statusBreakdown,
      totalActivities,
      recentActivities: recentActivityItems,
    };

    if (view === "me") {
      const needsAttentionCount = statusBreakdown
        .filter((item) => isNeedsAttentionStatus(item.status))
        .reduce((sum, item) => sum + item.count, 0);

      const summary: MeDashboardSummary = {
        view: "me",
        needsAttentionCount,
        ...base,
      };

      return summary;
    }

    if (view === "team") {
      const assigneeGroups =
        await dashboardRepository.groupLeadsByAssigneeAndStatus(leadScope);
      const assigneeStats = await buildAssigneeStats(
        aggregateByAssignee(assigneeGroups),
        true,
      );

      const summary: TeamDashboardSummary = {
        view: "team",
        assigneeStats,
        ...base,
      };

      return summary;
    }

    const [teamGroups, assigneeGroups] = await Promise.all([
      dashboardRepository.groupLeadsByTeamAndStatus(leadScope),
      dashboardRepository.groupLeadsByAssigneeAndStatus({
        ...leadScope,
        assignedToId: { not: null },
      }),
    ]);

    const topTeams = await buildTeamStats(aggregateByTeam(teamGroups));
    const topExecutives = (
      await buildAssigneeStats(aggregateByAssignee(assigneeGroups), false)
    ).slice(0, 10);

    const summary: OrgDashboardSummary = {
      view: "org",
      topTeams,
      topExecutives,
      ...base,
    };

    return summary;
  },
};
