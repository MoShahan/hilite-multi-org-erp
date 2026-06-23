import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { hasActiveMemberListFilters } from "../teamMemberListParams";

import type {
  TeamMemberListQuery,
  TeamMemberRoleOption,
} from "../teamsTypes";

type TeamMembersListToolbarProps = {
  query: TeamMemberListQuery;
  total: number;
  roles: TeamMemberRoleOption[];
  onQueryChange: (patch: Partial<TeamMemberListQuery>) => void;
  onClearFilters: () => void;
};

export const TeamMembersListToolbar = ({
  query,
  total,
  roles,
  onQueryChange,
  onClearFilters,
}: TeamMembersListToolbarProps) => {
  const [searchInput, setSearchInput] = useState(query.search);

  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput.trim() !== query.search.trim()) {
        onQueryChange({ search: searchInput.trim(), page: 1 });
      }
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput, query.search, onQueryChange]);

  const rangeStart =
    total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const rangeEnd = Math.min(query.page * query.pageSize, total);
  const hasFilters = hasActiveMemberListFilters(query);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search members..."
            className={cn(
              "border-0 bg-background/80 pl-9 shadow-sm",
              searchInput ? "pr-9" : undefined,
            )}
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                onQueryChange({ search: "", page: 1 });
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Select
          value={query.roleId || "all"}
          onValueChange={(value) =>
            onQueryChange({
              roleId: value === "all" ? "" : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full bg-background/80 lg:w-52">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button variant="outline" onClick={onClearFilters} className="shrink-0">
            Clear filters
          </Button>
        ) : null}
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? hasFilters
            ? "No members match your filters"
            : "No members"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
