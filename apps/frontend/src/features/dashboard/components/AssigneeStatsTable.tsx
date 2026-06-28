import { PerformanceStatsTable } from "./PerformanceStatsTable";

import type { AssigneeLeadStats } from "../dashboardTypes";

type AssigneeStatsTableProps = {
  stats: AssigneeLeadStats[];
};

export const AssigneeStatsTable = ({ stats }: AssigneeStatsTableProps) => (
  <PerformanceStatsTable
    title="Leads by assignee"
    description="Workload and conversion per team member"
    emptyMessage="No leads in scope yet."
    nameColumnLabel="Assignee"
    rows={stats.map((row) => ({
      id: row.userId ?? "unassigned",
      name: row.name,
      total: row.total,
      won: row.won,
      lost: row.lost,
      winRate: row.winRate,
    }))}
  />
);
