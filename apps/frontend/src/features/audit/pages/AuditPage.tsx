import { ScrollText } from "lucide-react";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE_OPTIONS, TABLE_SKELETON_ROW_COUNT } from "@/lib/pagination";

import { AuditListToolbar } from "../components/AuditListToolbar";
import { AuditTable } from "../components/AuditTable";
import { hasActiveAuditListFilters } from "../auditListParams";
import { useAuditListQuery } from "../hooks/useAuditListQuery";
import {
  selectAuditListError,
  selectAuditListMeta,
  selectAuditListStatus,
  selectAuditLogs,
} from "../auditSelectors";

export const AuditPage = () => {
  const { query, patchQuery, clearFilters } = useAuditListQuery();
  const auditLogs = useAppSelector(selectAuditLogs);
  const listMeta = useAppSelector(selectAuditListMeta);
  const listStatus = useAppSelector(selectAuditListStatus);
  const listError = useAppSelector(selectAuditListError);

  const isLoading = listStatus === "idle" || listStatus === "loading";
  const total = listMeta?.total ?? 0;
  const hasFilters = hasActiveAuditListFilters(query);
  const showFilteredEmpty =
    !isLoading && listStatus === "success" && total === 0 && hasFilters;
  const showGlobalEmpty =
    !isLoading && listStatus === "success" && total === 0 && !hasFilters;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ScrollText className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit trail</h1>
          <p className="text-sm text-muted-foreground">
            Review organization activity and changes
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <AuditListToolbar
          query={query}
          total={total}
          hasActiveFilters={hasFilters}
          onPatchQuery={patchQuery}
          onClearFilters={clearFilters}
        />

        {listStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError ?? "Failed to load audit events."}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: TABLE_SKELETON_ROW_COUNT }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {showGlobalEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ScrollText className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No audit events yet</p>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as changes are made in your organization.
              </p>
            </div>
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No audit events match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && auditLogs.length > 0 && listMeta ? (
          <>
            <AuditTable auditLogs={auditLogs} />
            <ListPagination
              page={listMeta.page}
              pageSize={listMeta.pageSize}
              totalPages={listMeta.totalPages}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={(page) => patchQuery({ page })}
              onPageSizeChange={(pageSize) =>
                patchQuery({ pageSize, page: 1 })
              }
              className="border-t pt-4"
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
