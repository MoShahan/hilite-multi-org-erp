import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWinRate } from "@/lib/format";

import { DashboardWidgetCard } from "./DashboardWidgetCard";

export type PerformanceStatsRow = {
  id: string;
  name: string;
  total: number;
  won: number;
  lost: number;
  winRate: number | null;
};

type PerformanceStatsTableProps = {
  title: string;
  description: string;
  emptyMessage: string;
  nameColumnLabel: string;
  rows: PerformanceStatsRow[];
};

export const PerformanceStatsTable = ({
  title,
  description,
  emptyMessage,
  nameColumnLabel,
  rows,
}: PerformanceStatsTableProps) => (
  <DashboardWidgetCard title={title} description={description}>
    {rows.length === 0 ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : (
      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>{nameColumnLabel}</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Won</TableHead>
              <TableHead>Lost</TableHead>
              <TableHead>Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.total}</TableCell>
                <TableCell>{row.won}</TableCell>
                <TableCell>{row.lost}</TableCell>
                <TableCell>{formatWinRate(row.winRate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </DashboardWidgetCard>
);
