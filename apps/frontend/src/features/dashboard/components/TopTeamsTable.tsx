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

import type { TeamLeadStats } from "../dashboardTypes";

type TopTeamsTableProps = {
  teams: TeamLeadStats[];
};

const formatWinRate = (winRate: number | null) =>
  winRate === null ? "—" : `${winRate}%`;

export const TopTeamsTable = ({ teams }: TopTeamsTableProps) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Top teams</CardTitle>
      <CardDescription>Lead volume and conversion by team</CardDescription>
    </CardHeader>
    <CardContent>
      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No teams with leads yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Team</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Won</TableHead>
                <TableHead>Lost</TableHead>
                <TableHead>Win rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((row) => (
                <TableRow key={row.teamId}>
                  <TableCell className="font-medium">{row.teamName}</TableCell>
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
