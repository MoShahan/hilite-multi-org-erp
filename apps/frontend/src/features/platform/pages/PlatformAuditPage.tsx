import { ScrollText } from "lucide-react";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditTable } from "@/features/audit/components/AuditTable";
import { hasActivePlatformAuditListFilters } from "@/features/audit/auditListParams";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { PlatformAuditListToolbar } from "../components/PlatformAuditListToolbar";
import { usePlatformAuditListQuery } from "../hooks/usePlatformAuditListQuery";
import { fetchOrganizations } from "../platformSlice";
import {
  selectOrganizations,
  selectPlatformAuditListError,
  selectPlatformAuditListMeta,
  selectPlatformAuditListStatus,
  selectPlatformAuditLogs,
} from "../platformSelectors";

export const PlatformAuditPage = () => {
  const dispatch = useAppDispatch();
  const { query, patchQuery, clearFilters } = usePlatformAuditListQuery();
  const auditLogs = useAppSelector(selectPlatformAuditLogs);
  const listMeta = useAppSelector(selectPlatformAuditListMeta);
  const listStatus = useAppSelector(selectPlatformAuditListStatus);
  const listError = useAppSelector(selectPlatformAuditListError);
  const organizations = useAppSelector(selectOrganizations);

  useEffect(() => {
    void dispatch(
      fetchOrganizations({
        search: "",
        status: "ALL",
        sortBy: "name",
        sortOrder: "asc",
        page: 1,
        pageSize: 100,
      }),
    );
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ScrollText className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Platform audit trail
          </h1>
          <p className="text-sm text-muted-foreground">
            Review activity across all organizations
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <PlatformAuditListToolbar
          query={query}
          organizations={organizations}
          hasActiveFilters={hasActivePlatformAuditListFilters(query)}
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
            <AuditTable auditLogs={auditLogs} showOrganization />
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
