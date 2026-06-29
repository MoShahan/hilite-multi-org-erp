import { ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

import { LeadStatusBadge } from "./LeadStatusBadge";

import type { LeadStatusHistoryEntry } from "../leadsTypes";

type LeadStatusHistoryProps = {
  entries: LeadStatusHistoryEntry[];
  isLoading: boolean;
};

export const LeadStatusHistory = ({
  entries,
  isLoading,
}: LeadStatusHistoryProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No status history available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {entry.kind === "created" ? (
                <>
                  <span className="text-sm font-semibold">Created as</span>
                  <LeadStatusBadge status={entry.toStatus} />
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <LeadStatusBadge status={entry.fromStatus} />
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <LeadStatusBadge status={entry.toStatus} />
                </div>
              )}
              {entry.changedBy ? (
                <span className="text-xs text-muted-foreground">
                  by {entry.changedBy.name}
                </span>
              ) : null}
            </div>
            <time className="text-xs text-muted-foreground">
              {formatDateTime(entry.changedAt)}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
};
