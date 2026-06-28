import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { LeadStatusBadge } from "./LeadStatusBadge";

import type { Lead, LeadListSortBy, LeadListSortOrder } from "../leadsTypes";

type LeadsTableProps = {
  leads: Lead[];
  sortBy: LeadListSortBy;
  sortOrder: LeadListSortOrder;
  listSearch: string;
  onSortChange: (sortBy: LeadListSortBy, sortOrder: LeadListSortOrder) => void;
};

type SortableHeaderProps = {
  label: string;
  column: LeadListSortBy;
  sortBy: LeadListSortBy;
  sortOrder: LeadListSortOrder;
  onSortChange: LeadsTableProps["onSortChange"];
  className?: string;
};

const SortableHeader = ({
  label,
  column,
  sortBy,
  sortOrder,
  onSortChange,
  className,
}: SortableHeaderProps) => {
  const isActive = sortBy === column;

  const handleClick = () => {
    if (isActive) {
      onSortChange(column, sortOrder === "asc" ? "desc" : "asc");
      return;
    }

    onSortChange(column, column === "name" ? "asc" : "desc");
  };

  const SortIcon = isActive
    ? sortOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className={cn("h-11 bg-muted/40", className)}>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <SortIcon className="size-3.5" />
      </button>
    </TableHead>
  );
};

const PlainHeader = ({ label }: { label: string }) => (
  <TableHead className="h-11 bg-muted/40 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
    {label}
  </TableHead>
);

export const LeadsTable = ({
  leads,
  sortBy,
  sortOrder,
  listSearch,
  onSortChange,
}: LeadsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <SortableHeader
              label="Name"
              column="name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <PlainHeader label="Mobile" />
            <PlainHeader label="Email" />
            <SortableHeader
              label="Team"
              column="team"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <SortableHeader
              label="Assigned user"
              column="assignee"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <SortableHeader
              label="Status"
              column="status"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <PlainHeader label="Source" />
            <PlainHeader label="Project" />
            <SortableHeader
              label="Created"
              column="createdAt"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() =>
                navigate(`/leads/${lead.id}${listSearch}`, {
                  state: { listSearch },
                })
              }
            >
              <TableCell className="py-3 font-medium">{lead.name}</TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {lead.mobileNumber ?? "—"}
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {lead.email ?? "—"}
              </TableCell>
              <TableCell className="py-3">{lead.team.name}</TableCell>
              <TableCell className="py-3">
                {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
              </TableCell>
              <TableCell className="py-3">
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {lead.source ?? "—"}
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {lead.project ?? "—"}
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {formatDate(lead.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
