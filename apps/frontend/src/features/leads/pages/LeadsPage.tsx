import { Kanban, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { PERMISSIONS } from "@/constants/permissions";
import {
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { teamsService } from "@/features/teams/teamsService";
import { usersService } from "@/features/users/usersService";
import { ApiClientError } from "@/lib/api-client";
import { PAGE_SIZE_OPTIONS, TABLE_SKELETON_ROW_COUNT } from "@/lib/pagination";

import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { LeadsListToolbar } from "../components/LeadsListToolbar";
import { LeadsTable } from "../components/LeadsTable";
import { useLeadListQuery } from "../hooks/useLeadListQuery";
import { hasActiveListFilters } from "../leadListParams";
import {
  selectLeads,
  selectLeadsListError,
  selectLeadsListMeta,
  selectLeadsListStatus,
} from "../leadsSelectors";

import type { AssigneeOption, TeamFilterOption } from "../leadsTypes";

export const LeadsPage = () => {
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const canCreateLead = useAppSelector(
    selectHasPermission(PERMISSIONS.LEADS_WRITE),
  );
  const canFilterByTeam = useAppSelector(
    selectHasPermission(PERMISSIONS.LEADS_READ_ORG),
  );
  const canReadTeams = useAppSelector(
    selectHasPermission(PERMISSIONS.TEAMS_READ),
  );
  const canReadUsers = useAppSelector(
    selectHasAnyPermission([
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_READ_TEAM,
    ]),
  );
  const canFilterByAssignee = useAppSelector(
    selectHasAnyPermission([
      PERMISSIONS.LEADS_READ_TEAM,
      PERMISSIONS.LEADS_READ_ORG,
    ]),
  );
  const { query, patchQuery, clearFilters, refetch, listSearch } =
    useLeadListQuery();

  const leads = useAppSelector(selectLeads);
  const listMeta = useAppSelector(selectLeadsListMeta);
  const listStatus = useAppSelector(selectLeadsListStatus);
  const listError = useAppSelector(selectLeadsListError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teams, setTeams] = useState<TeamFilterOption[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);

  useEffect(() => {
    if (!canReadTeams) return;

    const loadTeams = async () => {
      try {
        const result = await teamsService.listTeamOptions();
        setTeams(result.teams);
      } catch (error) {
        if (error instanceof ApiClientError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load teams");
        }
      }
    };

    void loadTeams();
  }, [canReadTeams]);

  useEffect(() => {
    if (!canReadUsers) return;

    const loadAssignees = async () => {
      try {
        const result = await usersService.listUserOptions({
          for: "filter",
          ...(query.teamId ? { teamId: query.teamId } : {}),
        });
        setAssignees(result.users);
      } catch (error) {
        if (error instanceof ApiClientError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load assignees");
        }
      }
    };

    void loadAssignees();
  }, [canReadUsers, query.teamId]);

  const isLoading = listStatus === "loading" || listStatus === "idle";
  const total = listMeta?.total ?? 0;
  const totalPages = listMeta?.totalPages ?? 1;
  const hasFilters = hasActiveListFilters(query);
  const showFilteredEmpty =
    !isLoading && listStatus === "success" && total === 0 && hasFilters;
  const showGlobalEmpty =
    !isLoading && listStatus === "success" && total === 0 && !hasFilters;

  if (!hasSalesErpModule) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Kanban className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground">
              Manage sales leads, assignments, and follow-ups.
            </p>
          </div>
        </div>
        {canCreateLead ? (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shadow-sm"
          >
            <Plus className="size-4" />
            Add lead
          </Button>
        ) : null}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <LeadsListToolbar
          query={query}
          total={total}
          teams={teams}
          assignees={assignees}
          showTeamFilter={canFilterByTeam && canReadTeams}
          showAssigneeFilter={canFilterByAssignee && canReadUsers}
          onQueryChange={patchQuery}
        />

        {listError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError}
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
              <Kanban className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No leads yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first lead to start tracking opportunities.
              </p>
            </div>
            {canCreateLead ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Add lead
              </Button>
            ) : null}
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No leads match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && leads.length > 0 && listMeta ? (
          <>
            <LeadsTable
              leads={leads}
              sortBy={query.sortBy}
              sortOrder={query.sortOrder}
              listSearch={listSearch}
              onSortChange={(sortBy, sortOrder) =>
                patchQuery({ sortBy, sortOrder, page: 1 })
              }
            />
            <ListPagination
              page={query.page}
              pageSize={query.pageSize}
              totalPages={totalPages}
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

      {canCreateLead ? (
        <CreateLeadDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={() => refetch()}
        />
      ) : null}
    </div>
  );
};
