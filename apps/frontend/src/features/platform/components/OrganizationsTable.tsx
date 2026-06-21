import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { EntityAvatar } from "@/components/EntityAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { OrganizationStatusBadge } from "./OrganizationStatusBadge";

import type {
  Organization,
  OrganizationListSortBy,
  OrganizationListSortOrder,
} from "../platformTypes";

type OrganizationsTableProps = {
  organizations: Organization[];
  sortBy: OrganizationListSortBy;
  sortOrder: OrganizationListSortOrder;
  listSearch: string;
  onSortChange: (
    sortBy: OrganizationListSortBy,
    sortOrder: OrganizationListSortOrder,
  ) => void;
  onStatusAction: (organization: Organization) => void;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
};

type SortableHeaderProps = {
  label: string;
  column: OrganizationListSortBy;
  sortBy: OrganizationListSortBy;
  sortOrder: OrganizationListSortOrder;
  onSortChange: OrganizationsTableProps["onSortChange"];
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

export const OrganizationsTable = ({
  organizations,
  sortBy,
  sortOrder,
  listSearch,
  onSortChange,
  onStatusAction,
}: OrganizationsTableProps) => {
  const navigate = useNavigate();

  const openOrganization = (organization: Organization) => {
    navigate(`/platform/organizations/${organization.id}${listSearch}`, {
      state: { listSearch },
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <SortableHeader
              label="Organization"
              column="name"
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
              label="Users"
              column="userCount"
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
            <TableHead className="h-11 w-[70px] bg-muted/40">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization) => (
            <TableRow
              key={organization.id}
              className="cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() => openOrganization(organization)}
            >
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <EntityAvatar
                    name={organization.name}
                    imageUrl={organization.logoUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{organization.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {organization.code}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <OrganizationStatusBadge status={organization.status} />
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  {organization.userCount}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(organization.createdAt)}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
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
                      onClick={() => openOrganization(organization)}
                    >
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onStatusAction(organization)}
                    >
                      {organization.status === "ACTIVE"
                        ? "Suspend"
                        : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
