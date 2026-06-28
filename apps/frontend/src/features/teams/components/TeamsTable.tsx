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

import type {
  Team,
  TeamListSortBy,
  TeamListSortOrder,
} from "../teamsTypes";

type TeamsTableProps = {
  teams: Team[];
  sortBy: TeamListSortBy;
  sortOrder: TeamListSortOrder;
  listSearch: string;
  onSortChange: (sortBy: TeamListSortBy, sortOrder: TeamListSortOrder) => void;
};

type SortableHeaderProps = {
  label: string;
  column: TeamListSortBy;
  sortBy: TeamListSortBy;
  sortOrder: TeamListSortOrder;
  onSortChange: TeamsTableProps["onSortChange"];
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

export const TeamsTable = ({
  teams,
  sortBy,
  sortOrder,
  listSearch,
  onSortChange,
}: TeamsTableProps) => {
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
            <SortableHeader
              label="Members"
              column="memberCount"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
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
          {teams.map((team) => (
            <TableRow
              key={team.id}
              className="cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() =>
                navigate(`/teams/${team.id}${listSearch}`, {
                  state: { listSearch },
                })
              }
            >
              <TableCell className="py-3 font-medium">{team.name}</TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {team.memberCount}
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">
                {formatDate(team.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
