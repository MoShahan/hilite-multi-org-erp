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
import { formatWinRate } from "@/lib/format";

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
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
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
    </CardContent>
  </Card>
);
