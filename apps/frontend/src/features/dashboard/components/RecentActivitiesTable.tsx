import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/lib/format";

import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { ACTIVITY_TYPE_LABELS } from "../dashboardTypes";

import type { RecentActivityItem } from "../dashboardTypes";

type RecentActivitiesTableProps = {
  activities: RecentActivityItem[];
};

const truncateNotes = (notes: string, maxLength = 80) =>
  notes.length <= maxLength ? notes : `${notes.slice(0, maxLength)}…`;

export const RecentActivitiesTable = ({
  activities,
}: RecentActivitiesTableProps) => (
  <DashboardWidgetCard
    title="Recent activities (table)"
    description="Tabular view of latest interactions"
  >
    {activities.length === 0 ? (
      <p className="text-sm text-muted-foreground">No activities logged yet.</p>
    ) : (
      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Type</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="hidden sm:table-cell">By</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="whitespace-nowrap">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    to={`/leads/${activity.leadId}`}
                    className="text-sidebar-primary hover:underline"
                  >
                    {activity.leadName}
                  </Link>
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate md:table-cell text-muted-foreground">
                  {truncateNotes(activity.notes)}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap sm:table-cell text-muted-foreground">
                  {activity.createdBy.name}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(activity.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </DashboardWidgetCard>
);
