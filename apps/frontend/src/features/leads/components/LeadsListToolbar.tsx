import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { LEAD_STATUS_FILTER_OPTIONS } from "../leadsTypes";

import type {
  AssigneeOption,
  LeadListQuery,
  LeadListStatusFilter,
  TeamFilterOption,
} from "../leadsTypes";

type LeadsListToolbarProps = {
  query: LeadListQuery;
  total: number;
  teams: TeamFilterOption[];
  assignees: AssigneeOption[];
  showTeamFilter: boolean;
  showAssigneeFilter: boolean;
  onQueryChange: (patch: Partial<LeadListQuery>) => void;
};

export const LeadsListToolbar = ({
  query,
  total,
  teams,
  assignees,
  showTeamFilter,
  showAssigneeFilter,
  onQueryChange,
}: LeadsListToolbarProps) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 p-3">
        <div className="relative min-w-0 flex-1 basis-[180px]">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search leads..."
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
          value={query.status}
          onValueChange={(value) =>
            onQueryChange({
              status: value as LeadListStatusFilter,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-44 shrink-0 bg-background/80">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {LEAD_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showTeamFilter ? (
          <Select
            value={query.teamId || "all"}
            onValueChange={(value) =>
              onQueryChange({
                teamId: value === "all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-44 shrink-0 bg-background/80">
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {showAssigneeFilter ? (
          <Select
            value={query.assignedToId || "all"}
            onValueChange={(value) =>
              onQueryChange({
                assignedToId: value === "all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-44 shrink-0 bg-background/80">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No leads"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
