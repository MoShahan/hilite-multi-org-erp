import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
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

import type {
  Lead,
  LeadListSortBy,
  LeadListSortOrder,
} from "../leadsTypes";

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
    <TableHead className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
      >
        {label}
        <SortIcon className={cn("size-3.5", isActive ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
};

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
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <SortableHeader
              label="Name"
              column="name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <TableHead>Mobile</TableHead>
            <TableHead>Email</TableHead>
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
            <TableHead>Source</TableHead>
            <TableHead>Project</TableHead>
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
              className="cursor-pointer"
              onClick={() =>
                navigate(`/leads/${lead.id}${listSearch}`, {
                  state: { listSearch },
                })
              }
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {lead.mobileNumber ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.email ?? "—"}
              </TableCell>
              <TableCell>{lead.team.name}</TableCell>
              <TableCell>
                {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
              </TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.source ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.project ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(lead.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
