import { Plus, UsersRound } from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { selectHasPermission } from "@/features/auth/authSelectors";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { CreateTeamDialog } from "../components/CreateTeamDialog";
import { TeamsListToolbar } from "../components/TeamsListToolbar";
import { TeamsTable } from "../components/TeamsTable";
import { useTeamListQuery } from "../hooks/useTeamListQuery";
import { hasActiveListFilters } from "../teamListParams";
import {
  selectTeams,
  selectTeamsListError,
  selectTeamsListMeta,
  selectTeamsListStatus,
} from "../teamsSelectors";

export const TeamsPage = () => {
  const canCreateTeam = useAppSelector(selectHasPermission("teams:write"));
  const { query, patchQuery, clearFilters, refetch, listSearch } =
    useTeamListQuery();

  const teams = useAppSelector(selectTeams);
  const listMeta = useAppSelector(selectTeamsListMeta);
  const listStatus = useAppSelector(selectTeamsListStatus);
  const listError = useAppSelector(selectTeamsListError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
            <UsersRound className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
            <p className="text-sm text-muted-foreground">
              Manage teams and team-scoped users.
            </p>
          </div>
        </div>
        {canCreateTeam ? (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shadow-sm"
          >
            <Plus className="size-4" />
            Create team
          </Button>
        ) : null}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <TeamsListToolbar
          query={query}
          total={total}
          onQueryChange={patchQuery}
        />

        {listStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError ?? "Failed to load teams."}
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
              <UsersRound className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No teams yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first team to get started.
              </p>
            </div>
            {canCreateTeam ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create team
              </Button>
            ) : null}
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No teams match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && teams.length > 0 && listMeta ? (
          <>
            <TeamsTable
              teams={teams}
              sortBy={query.sortBy}
              sortOrder={query.sortOrder}
              listSearch={listSearch}
              onSortChange={handleSortChange}
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

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refetch}
      />
    </div>
  );
};
