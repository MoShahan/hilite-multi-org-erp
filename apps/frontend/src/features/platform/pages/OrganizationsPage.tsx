import { Building2, Plus } from "lucide-react";
import { useState } from "react";

import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api-client";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { CreateOrganizationDialog } from "../components/CreateOrganizationDialog";
import { OrganizationsListToolbar } from "../components/OrganizationsListToolbar";
import { OrganizationsTable } from "../components/OrganizationsTable";
import { SuspendOrganizationDialog } from "../components/SuspendOrganizationDialog";
import { useOrganizationListQuery } from "../hooks/useOrganizationListQuery";
import { hasActiveListFilters } from "../organizationListParams";
import { updateOrganizationStatus } from "../platformSlice";
import {
  selectOrganizations,
  selectOrganizationsListError,
  selectOrganizationsListMeta,
  selectOrganizationsListStatus,
} from "../platformSelectors";

import type { Organization } from "../platformTypes";

export const OrganizationsPage = () => {
  const dispatch = useAppDispatch();
  const { query, patchQuery, clearFilters, refetch, listSearch } =
    useOrganizationListQuery();

  const organizations = useAppSelector(selectOrganizations);
  const listMeta = useAppSelector(selectOrganizationsListMeta);
  const listStatus = useAppSelector(selectOrganizationsListStatus);
  const listError = useAppSelector(selectOrganizationsListError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusAction = (organization: Organization) => {
    setSelectedOrganization(organization);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedOrganization) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const nextStatus =
        selectedOrganization.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

      await dispatch(
        updateOrganizationStatus({
          id: selectedOrganization.id,
          status: nextStatus,
        }),
      ).unwrap();

      toast.success(
        nextStatus === "SUSPENDED"
          ? "Organization suspended"
          : "Organization activated",
      );
      setStatusDialogOpen(false);
      setSelectedOrganization(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update organization status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSortChange = (
    sortBy: typeof query.sortBy,
    sortOrder: typeof query.sortOrder,
  ) => {
    patchQuery({ sortBy, sortOrder, page: 1 });
  };

  const isLoading = listStatus === "idle" || listStatus === "loading";
  const total = listMeta?.total ?? 0;
  const hasFilters = hasActiveListFilters(query);
  const showFilteredEmpty =
    !isLoading && listStatus === "success" && total === 0 && hasFilters;
  const showGlobalEmpty =
    !isLoading && listStatus === "success" && total === 0 && !hasFilters;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Organizations
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage tenants across the platform.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="shadow-sm"
        >
          <Plus className="size-4" />
          Create organization
        </Button>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
          <OrganizationsListToolbar
            query={query}
            total={total}
            onQueryChange={patchQuery}
          />

          {listStatus === "error" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {listError ?? "Failed to load organizations."}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: query.pageSize }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : null}

          {showGlobalEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No organizations yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first organization to get started.
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create organization
              </Button>
            </div>
          ) : null}

          {showFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
              <div>
                <p className="font-medium">No organizations match your filters</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : null}

          {!isLoading && organizations.length > 0 && listMeta ? (
            <>
              <OrganizationsTable
                organizations={organizations}
                sortBy={query.sortBy}
                sortOrder={query.sortOrder}
                listSearch={listSearch}
                onSortChange={handleSortChange}
                onStatusAction={handleStatusAction}
              />
              <ListPagination
                page={query.page}
                pageSize={query.pageSize}
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

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refetch}
      />

      {selectedOrganization ? (
        <SuspendOrganizationDialog
          open={statusDialogOpen}
          onOpenChange={(open) => {
            setStatusDialogOpen(open);

            if (!open) {
              setSelectedOrganization(null);
            }
          }}
          organizationName={selectedOrganization.name}
          currentStatus={selectedOrganization.status}
          isSubmitting={isUpdatingStatus}
          onConfirm={() => void handleConfirmStatusChange()}
        />
      ) : null}
    </div>
  );
};
