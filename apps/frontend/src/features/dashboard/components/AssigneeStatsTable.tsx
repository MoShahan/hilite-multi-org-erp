import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AssigneeLeadStats } from "../dashboardTypes";

type AssigneeStatsTableProps = {
  stats: AssigneeLeadStats[];
};

const formatWinRate = (winRate: number | null) =>
  winRate === null ? "—" : `${winRate}%`;

export const AssigneeStatsTable = ({ stats }: AssigneeStatsTableProps) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Leads by assignee</CardTitle>
      <CardDescription>Workload and conversion per team member</CardDescription>
    </CardHeader>
    <CardContent>
      {stats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Assignee</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Won</TableHead>
                <TableHead>Lost</TableHead>
                <TableHead>Win rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((row) => (
                <TableRow key={row.userId ?? "unassigned"}>
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
    </CardContent>
  </Card>
);
