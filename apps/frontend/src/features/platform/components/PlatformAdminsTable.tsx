import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

import { EntityAvatar } from "@/components/EntityAvatar";
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
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import type {
  PlatformUser,
  PlatformUserListSortBy,
  PlatformUserListSortOrder,
} from "../platformTypes";

type PlatformAdminsTableProps = {
  users: PlatformUser[];
  sortBy: PlatformUserListSortBy;
  sortOrder: PlatformUserListSortOrder;
  canManageStatus: boolean;
  currentUserId?: string;
  onSortChange: (
    sortBy: PlatformUserListSortBy,
    sortOrder: PlatformUserListSortOrder,
  ) => void;
  onStatusAction: (user: PlatformUser) => void;
};

type SortableHeaderProps = {
  label: string;
  column: PlatformUserListSortBy;
  sortBy: PlatformUserListSortBy;
  sortOrder: PlatformUserListSortOrder;
  onSortChange: PlatformAdminsTableProps["onSortChange"];
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

export const PlatformAdminsTable = ({
  users,
  sortBy,
  sortOrder,
  canManageStatus,
  currentUserId,
  onSortChange,
  onStatusAction,
}: PlatformAdminsTableProps) => {
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
              label="Status"
              column="status"
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
            {canManageStatus ? (
              <TableHead className="h-11 w-12 bg-muted/40" />
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const canChangeStatus =
              canManageStatus && user.id !== currentUserId;

            return (
              <TableRow
                key={user.id}
                className="transition-colors hover:bg-muted/40"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <EntityAvatar name={user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="py-3">
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
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
                          <DropdownMenuItem onClick={() => onStatusAction(user)}>
                            {user.status === "ACTIVE"
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
