import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStatusBadge } from "@/features/users/components/UserStatusBadge";
import { cn } from "@/lib/utils";

import type {
  TeamMember,
  TeamMemberListSortBy,
  TeamMemberListSortOrder,
} from "../teamsTypes";

type TeamMembersTableProps = {
  members: TeamMember[];
  sortBy: TeamMemberListSortBy;
  sortOrder: TeamMemberListSortOrder;
  canManageStatus: boolean;
  currentUserId?: string;
  onSortChange: (
    sortBy: TeamMemberListSortBy,
    sortOrder: TeamMemberListSortOrder,
  ) => void;
  onStatusAction: (member: TeamMember) => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );

type SortableHeaderProps = {
  label: string;
  column: TeamMemberListSortBy;
  sortBy: TeamMemberListSortBy;
  sortOrder: TeamMemberListSortOrder;
  onSortChange: TeamMembersTableProps["onSortChange"];
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
    onSortChange(column, column === "name" || column === "role" ? "asc" : "desc");
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

export const TeamMembersTable = ({
  members,
  sortBy,
  sortOrder,
  canManageStatus,
  currentUserId,
  onSortChange,
  onStatusAction,
}: TeamMembersTableProps) => {
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
              label="Email"
              column="email"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <SortableHeader
              label="Role"
              column="role"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <TableHead className="h-11 bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Status
            </TableHead>
            <SortableHeader
              label="Created"
              column="createdAt"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            {canManageStatus ? (
              <TableHead className="h-11 w-12 bg-muted/40" />
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const canChangeStatus =
              canManageStatus && member.id !== currentUserId;

            return (
              <TableRow key={member.id} className="hover:bg-muted/40">
                <TableCell className="py-3 font-medium">{member.name}</TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell className="py-3">
                  {member.role?.name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <UserStatusBadge status={member.status} />
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {formatDate(member.createdAt)}
                </TableCell>
                {canManageStatus ? (
                  <TableCell className="py-3">
                    {canChangeStatus ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onStatusAction(member)}
                          >
                            {member.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
