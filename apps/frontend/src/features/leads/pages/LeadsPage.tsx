import { Kanban, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { PERMISSIONS } from "@/constants/permissions";
import { teamsService } from "@/features/teams/teamsService";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { LeadsListToolbar } from "../components/LeadsListToolbar";
import { LeadsTable } from "../components/LeadsTable";
import { useLeadListQuery } from "../hooks/useLeadListQuery";
import { hasActiveListFilters } from "../leadListParams";
import { leadsService } from "../leadsService";
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
  const canCreateLead = useAppSelector(selectHasPermission(PERMISSIONS.LEADS_WRITE));
  const canFilterByTeam = useAppSelector(selectHasPermission(PERMISSIONS.LEADS_READ_ORG));
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
    if (!canFilterByTeam) return;

    void teamsService
      .listTeams({
        search: "",
        membership: "ALL",
        sortBy: "name",
        sortOrder: "asc",
        page: 1,
        pageSize: 100,
      })
      .then((result) => {
        setTeams(result.teams.map((team) => ({ id: team.id, name: team.name })));
      });
  }, [canFilterByTeam]);

  useEffect(() => {
    if (!canFilterByAssignee) return;

    const teamId = query.teamId || teams[0]?.id;
    if (!teamId) {
      setAssignees([]);
      return;
    }

    void leadsService.listAssignableUsers(teamId).then((result) => {
      setAssignees(
        result.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        })),
      );
    });
  }, [canFilterByAssignee, query.teamId, teams]);

  const isLoading = listStatus === "loading" || listStatus === "idle";
  const total = listMeta?.total ?? 0;
  const totalPages = listMeta?.totalPages ?? 1;
  const hasFilters = hasActiveListFilters(query);

  if (!hasSalesErpModule) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Kanban className="size-4" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage sales leads, assignments, and follow-ups.
          </p>
        </div>
        {canCreateLead ? (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Add lead
          </Button>
        ) : null}
      </div>

      <LeadsListToolbar
        query={query}
        total={total}
        teams={teams}
        assignees={assignees}
        showTeamFilter={canFilterByTeam}
        showAssigneeFilter={canFilterByAssignee}
        onQueryChange={patchQuery}
      />

      {listError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium">
            {hasFilters ? "No leads match your filters" : "No leads yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting search or filters to find leads."
              : "Create your first lead to start tracking opportunities."}
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => clearFilters()}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
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
            onPageSizeChange={(pageSize) => patchQuery({ pageSize, page: 1 })}
          />
        </>
      )}

      <CreateLeadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => refetch()}
      />
    </div>
  );
};
