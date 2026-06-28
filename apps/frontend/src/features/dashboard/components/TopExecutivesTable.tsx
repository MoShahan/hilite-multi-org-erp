import { PerformanceStatsTable } from "./PerformanceStatsTable";

import type { AssigneeLeadStats } from "../dashboardTypes";

type TopExecutivesTableProps = {
  executives: AssigneeLeadStats[];
};

export const TopExecutivesTable = ({
  executives,
}: TopExecutivesTableProps) => (
  <PerformanceStatsTable
    title="Top executives"
    description="Assigned leads and conversion by executive"
    emptyMessage="No assigned leads in the organization yet."
    nameColumnLabel="Executive"
    rows={executives.map((row) => ({
      id: row.userId ?? row.name,
      name: row.name,
      total: row.total,
      won: row.won,
      lost: row.lost,
      winRate: row.winRate,
    }))}
  />
);
