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
import { cn } from "@/lib/utils";

import { UserStatusBadge } from "./UserStatusBadge";

import type {
  User,
  UserListSortBy,
  UserListSortOrder,
} from "../usersTypes";

type UsersTableProps = {
  users: User[];
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  canManageStatus: boolean;
  currentUserId?: string;
  onSortChange: (sortBy: UserListSortBy, sortOrder: UserListSortOrder) => void;
  onStatusAction: (user: User) => void;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
};

type SortableHeaderProps = {
  label: string;
  column: UserListSortBy;
  sortBy: UserListSortBy;
  sortOrder: UserListSortOrder;
  onSortChange: UsersTableProps["onSortChange"];
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

export const UsersTable = ({
  users,
  sortBy,
  sortOrder,
  canManageStatus,
  currentUserId,
  onSortChange,
  onStatusAction,
}: UsersTableProps) => {
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
            <SortableHeader
              label="Team"
              column="team"
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
                <TableCell className="py-3 font-medium">{user.name}</TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="py-3">
                  {user.role ? (
                    <span className="text-sm">{user.role.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {user.team ? (
                    <span className="text-sm">{user.team.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
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
