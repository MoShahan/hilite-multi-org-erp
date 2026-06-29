import { Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type {
  OrganizationRoleOption,
  TeamFilterOption,
  UserListQuery,
  UserListStatusFilter,
} from "../usersTypes";

type UsersListToolbarProps = {
  query: UserListQuery;
  total: number;
  roles: OrganizationRoleOption[];
  teams: TeamFilterOption[];
  showRoleFilter: boolean;
  showTeamFilter: boolean;
  onQueryChange: (patch: Partial<UserListQuery>) => void;
};

const STATUS_OPTIONS: {
  value: UserListStatusFilter;
  label: string;
}[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const STATUS_FILTER_ANIMATION_MS = 300;

const StatusFilter = ({
  value,
  onChange,
}: {
  value: UserListStatusFilter;
  onChange: (value: UserListStatusFilter) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateIndicator = () => {
      const activeIndex = STATUS_OPTIONS.findIndex(
        (option) => option.value === value,
      );
      const activeButton = container.querySelector<HTMLElement>(
        `[data-status-option="${activeIndex}"]`,
      );
      if (!activeButton) return;

      setIndicator({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    };

    updateIndicator();
    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="relative flex rounded-lg border bg-background/80 p-1 shadow-sm"
    >
      <div
        aria-hidden
        className="absolute top-1 bottom-1 rounded-md bg-primary shadow-sm"
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: `left ${STATUS_FILTER_ANIMATION_MS}ms ease-out, width ${STATUS_FILTER_ANIMATION_MS}ms ease-out`,
        }}
      />
      {STATUS_OPTIONS.map((option, index) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            data-status-option={index}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-300 ease-out",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export const UsersListToolbar = ({
  query,
  total,
  roles,
  teams,
  showRoleFilter,
  showTeamFilter,
  onQueryChange,
}: UsersListToolbarProps) => {
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
            placeholder="Search users..."
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
        <div className="shrink-0">
          <StatusFilter
            value={query.status}
            onChange={(status) => onQueryChange({ status, page: 1 })}
          />
        </div>
        {showRoleFilter ? (
          <Select
            value={query.roleId || "all"}
            onValueChange={(value) =>
              onQueryChange({
                roleId: value === "all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-40 shrink-0 bg-background/80">
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
        ) : null}
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
            <SelectTrigger className="w-40 shrink-0 bg-background/80">
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              <SelectItem value="none">No team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No users"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
