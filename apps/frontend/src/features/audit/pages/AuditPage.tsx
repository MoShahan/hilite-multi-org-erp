import { ScrollText } from "lucide-react";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

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

  return (
    <div className="space-y-6">
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

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <AuditListToolbar
          query={query}
          hasActiveFilters={hasActiveAuditListFilters(query)}
          onPatchQuery={patchQuery}
          onClearFilters={clearFilters}
        />

        {listStatus === "loading" ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {listStatus === "error" ? (
          <div className="p-8 text-center text-sm text-destructive">
            {listError}
          </div>
        ) : null}

        {listStatus === "success" && auditLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No audit events match your filters
          </div>
        ) : null}

        {listStatus === "success" && auditLogs.length > 0 ? (
          <>
            <AuditTable auditLogs={auditLogs} />
            {listMeta ? (
              <div className="border-t p-4">
                <ListPagination
                  page={listMeta.page}
                  pageSize={listMeta.pageSize}
                  totalPages={listMeta.totalPages}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={(page) => patchQuery({ page })}
                  onPageSizeChange={(pageSize) => patchQuery({ pageSize, page: 1 })}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};
