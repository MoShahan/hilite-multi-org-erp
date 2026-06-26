import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_TYPE_OPTIONS,
  type AuditListQuery,
} from "../auditTypes";

type AuditListToolbarProps = {
  query: AuditListQuery;
  hasActiveFilters: boolean;
  onPatchQuery: (patch: Partial<AuditListQuery>) => void;
  onClearFilters: () => void;
};

export const AuditListToolbar = ({
  query,
  hasActiveFilters,
  onPatchQuery,
  onClearFilters,
}: AuditListToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 border-b p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query.search}
            onChange={(event) => onPatchQuery({ search: event.target.value })}
            placeholder="Search summary or actor..."
            className="pl-9"
          />
        </div>
        <Select
          value={query.action}
          onValueChange={(value) =>
            onPatchQuery({ action: value as AuditListQuery["action"] })
          }
        >
          <SelectTrigger className="w-full lg:w-[200px]">
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
            onPatchQuery({ entityType: value as AuditListQuery["entityType"] })
          }
        >
          <SelectTrigger className="w-full lg:w-[180px]">
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
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="date"
          value={query.from}
          onChange={(event) => onPatchQuery({ from: event.target.value })}
          className="sm:max-w-[180px]"
        />
        <Input
          type="date"
          value={query.to}
          onChange={(event) => onPatchQuery({ to: event.target.value })}
          className="sm:max-w-[180px]"
        />
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
};
