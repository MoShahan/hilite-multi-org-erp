import { PerformanceStatsTable } from "./PerformanceStatsTable";

import type { TeamLeadStats } from "../dashboardTypes";

type TopTeamsTableProps = {
  teams: TeamLeadStats[];
};

export const TopTeamsTable = ({ teams }: TopTeamsTableProps) => (
  <PerformanceStatsTable
    title="Top teams"
    description="Lead volume and conversion by team"
    emptyMessage="No teams with leads yet."
    nameColumnLabel="Team"
    rows={teams.map((row) => ({
      id: row.teamId,
      name: row.teamName,
      total: row.total,
      won: row.won,
      lost: row.lost,
      winRate: row.winRate,
    }))}
  />
);
