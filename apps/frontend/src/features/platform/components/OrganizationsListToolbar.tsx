import { Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type {
  OrganizationListQuery,
  OrganizationListStatusFilter,
} from "../platformTypes";

type OrganizationsListToolbarProps = {
  query: OrganizationListQuery;
  total: number;
  onQueryChange: (patch: Partial<OrganizationListQuery>) => void;
};

const STATUS_OPTIONS: {
  value: OrganizationListStatusFilter;
  label: string;
}[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

const STATUS_FILTER_ANIMATION_MS = 300;

type StatusFilterProps = {
  value: OrganizationListStatusFilter;
  onChange: (value: OrganizationListStatusFilter) => void;
};

const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateIndicator = () => {
      const activeIndex = STATUS_OPTIONS.findIndex(
        (option) => option.value === value,
      );
      const activeButton = container.querySelector<HTMLElement>(
        `[data-status-option="${activeIndex}"]`,
      );

      if (!activeButton) {
        return;
      }

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

export const OrganizationsListToolbar = ({
  query,
  total,
  onQueryChange,
}: OrganizationsListToolbarProps) => {
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

  const handleClearSearch = () => {
    setSearchInput("");
    onQueryChange({ search: "", page: 1 });
  };

  const rangeStart =
    total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const rangeEnd = Math.min(query.page * query.pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search organizations..."
            className={cn(
              "border-0 bg-background/80 pl-9 shadow-sm",
              searchInput ? "pr-9" : undefined,
            )}
          />
          {searchInput ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <StatusFilter
          value={query.status}
          onChange={(status) => onQueryChange({ status, page: 1 })}
        />
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No organizations"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
