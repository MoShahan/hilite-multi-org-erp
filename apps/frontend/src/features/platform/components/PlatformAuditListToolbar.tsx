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
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_TYPE_OPTIONS,
} from "@/features/audit/auditTypes";

import type { Organization, PlatformAuditListQuery } from "../platformTypes";

type PlatformAuditListToolbarProps = {
  query: PlatformAuditListQuery;
  total: number;
  organizations: Organization[];
  hasActiveFilters: boolean;
  onPatchQuery: (patch: Partial<PlatformAuditListQuery>) => void;
  onClearFilters: () => void;
};

export const PlatformAuditListToolbar = ({
  query,
  total,
  organizations,
  hasActiveFilters,
  onPatchQuery,
  onClearFilters,
}: PlatformAuditListToolbarProps) => {
  const [searchInput, setSearchInput] = useState(query.search);

  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput.trim() !== query.search.trim()) {
        onPatchQuery({ search: searchInput.trim(), page: 1 });
      }
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput, query.search, onPatchQuery]);

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
            placeholder="Search summary or actor..."
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
                onPatchQuery({ search: "", page: 1 });
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Select
          value={query.organizationId || "ALL"}
          onValueChange={(value) =>
            onPatchQuery({
              organizationId: value === "ALL" ? "" : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-44 shrink-0 bg-background/80">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All organizations</SelectItem>
            {organizations.map((organization) => (
              <SelectItem key={organization.id} value={organization.id}>
                {organization.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={query.action}
          onValueChange={(value) =>
            onPatchQuery({
              action: value as PlatformAuditListQuery["action"],
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-44 shrink-0 bg-background/80">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All actions</SelectItem>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={query.entityType}
          onValueChange={(value) =>
            onPatchQuery({
              entityType: value as PlatformAuditListQuery["entityType"],
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-44 shrink-0 bg-background/80">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All entities</SelectItem>
            {AUDIT_ENTITY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={query.from}
          onChange={(event) =>
            onPatchQuery({ from: event.target.value, page: 1 })
          }
          className="w-40 shrink-0 bg-background/80 shadow-sm"
        />
        <Input
          type="date"
          value={query.to}
          onChange={(event) =>
            onPatchQuery({ to: event.target.value, page: 1 })
          }
          className="w-40 shrink-0 bg-background/80 shadow-sm"
        />
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="shrink-0"
          >
            <X className="mr-1 size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {total === 0
          ? "No audit events"
          : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
};
