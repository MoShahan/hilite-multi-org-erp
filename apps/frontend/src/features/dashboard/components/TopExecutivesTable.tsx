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

type TopExecutivesTableProps = {
  executives: AssigneeLeadStats[];
};

const formatWinRate = (winRate: number | null) =>
  winRate === null ? "—" : `${winRate}%`;

export const TopExecutivesTable = ({
  executives,
}: TopExecutivesTableProps) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Top executives</CardTitle>
      <CardDescription>Assigned leads and conversion by executive</CardDescription>
    </CardHeader>
    <CardContent>
      {executives.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No assigned leads in the organization yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Executive</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Won</TableHead>
                <TableHead>Lost</TableHead>
                <TableHead>Win rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executives.map((row) => (
                <TableRow key={row.userId ?? row.name}>
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
