import { Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type {
  TeamListMembershipFilter,
  TeamListQuery,
} from "../teamsTypes";

type TeamsListToolbarProps = {
  query: TeamListQuery;
  total: number;
  onQueryChange: (patch: Partial<TeamListQuery>) => void;
};

const MEMBERSHIP_OPTIONS: {
  value: TeamListMembershipFilter;
  label: string;
}[] = [
  { value: "ALL", label: "All" },
  { value: "WITH_MEMBERS", label: "With members" },
  { value: "EMPTY", label: "Empty" },
];

const FILTER_ANIMATION_MS = 300;

const MembershipFilter = ({
  value,
  onChange,
}: {
  value: TeamListMembershipFilter;
  onChange: (value: TeamListMembershipFilter) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateIndicator = () => {
      const activeIndex = MEMBERSHIP_OPTIONS.findIndex(
        (option) => option.value === value,
      );
      const activeButton = container.querySelector<HTMLElement>(
        `[data-membership-option="${activeIndex}"]`,
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
          transition: `left ${FILTER_ANIMATION_MS}ms ease-out, width ${FILTER_ANIMATION_MS}ms ease-out`,
        }}
      />
      {MEMBERSHIP_OPTIONS.map((option, index) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            data-membership-option={index}
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

export const TeamsListToolbar = ({
  query,
  total,
  onQueryChange,
}: TeamsListToolbarProps) => {
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
            placeholder="Search teams..."
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
          <MembershipFilter
            value={query.membership}
            onChange={(membership) => onQueryChange({ membership, page: 1 })}
          />
        </div>
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No teams"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
