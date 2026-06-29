import { Plus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSIONS } from "@/constants/permissions";
import {
  selectAuthUser,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { rolesService } from "@/features/roles/rolesService";
import { ApiClientError } from "@/lib/api-client";
import { PAGE_SIZE_OPTIONS, TABLE_SKELETON_ROW_COUNT } from "@/lib/pagination";

import { AddTeamMemberDialog } from "../components/AddTeamMemberDialog";
import { TeamMembersListToolbar } from "../components/TeamMembersListToolbar";
import { TeamMembersTable } from "../components/TeamMembersTable";
import { useTeamMemberListQuery } from "../hooks/useTeamMemberListQuery";
import { hasActiveMemberListFilters } from "../teamMemberListParams";
import {
  selectTeamMembers,
  selectTeamMembersError,
  selectTeamMembersMeta,
  selectTeamMembersStatus,
} from "../teamsSelectors";

import type { TeamMemberRoleOption } from "../teamsTypes";

export const MyTeamPage = () => {
  const authUser = useAppSelector(selectAuthUser);
  const canAddMember = useAppSelector(selectHasPermission(PERMISSIONS.USERS_WRITE_TEAM));
  const teamId = authUser?.team?.id;
  const teamName = authUser?.team?.name;

  const members = useAppSelector(selectTeamMembers);
  const membersMeta = useAppSelector(selectTeamMembersMeta);
  const membersStatus = useAppSelector(selectTeamMembersStatus);
  const membersError = useAppSelector(selectTeamMembersError);

  const { query, patchQuery, clearFilters, refetch } =
    useTeamMemberListQuery(teamId);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [roles, setRoles] = useState<TeamMemberRoleOption[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const result = await rolesService.listRoleOptions({ assignableFrom: "team" });
        setRoles(result.roles.map((role) => ({ id: role.id, name: role.name })));
      } catch (error) {
        setRoles([]);
        if (error instanceof ApiClientError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load roles");
        }
      }
    };

    void loadRoles();
  }, []);

  const handleSortChange = (
    sortBy: typeof query.sortBy,
    sortOrder: typeof query.sortOrder,
  ) => {
    patchQuery({ sortBy, sortOrder, page: 1 });
  };

  const isMembersLoading =
    membersStatus === "idle" || membersStatus === "loading";
  const total = membersMeta?.total ?? 0;
  const hasFilters = hasActiveMemberListFilters(query);
  const showFilteredEmpty =
    !isMembersLoading &&
    membersStatus === "success" &&
    total === 0 &&
    hasFilters;
  const showGlobalEmpty =
    !isMembersLoading &&
    membersStatus === "success" &&
    total === 0 &&
    !hasFilters;

  const memberCountLabel =
    membersMeta !== null
      ? `${membersMeta.total} ${membersMeta.total === 1 ? "member" : "members"}`
      : "";

  if (!teamId || !teamName) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          You are not assigned to a team. Contact your organization admin.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersRound className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{teamName}</h1>
            <p className="text-sm text-muted-foreground">
              {memberCountLabel || "Your team members"}
            </p>
          </div>
        </div>
        {canAddMember ? (
          <Button
            onClick={() => setAddMemberOpen(true)}
            className="shadow-sm"
          >
            <Plus className="size-4" />
            Add member
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-medium">Members</h2>

        <TeamMembersListToolbar
          query={query}
          total={total}
          roles={roles}
          onQueryChange={patchQuery}
          onClearFilters={clearFilters}
        />

        {membersStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {membersError ?? "Failed to load members."}
          </div>
        ) : null}

        {isMembersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: TABLE_SKELETON_ROW_COUNT }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {showGlobalEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <p className="font-medium">No members yet</p>
            <p className="text-sm text-muted-foreground">
              Add team-scoped users to your team.
            </p>
            {canAddMember ? (
              <Button onClick={() => setAddMemberOpen(true)}>
                <Plus className="size-4" />
                Add member
              </Button>
            ) : null}
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No members match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isMembersLoading && members.length > 0 && membersMeta ? (
          <>
            <TeamMembersTable
              members={members}
              sortBy={query.sortBy}
              sortOrder={query.sortOrder}
              canManageStatus={false}
              currentUserId={authUser?.id}
              onSortChange={handleSortChange}
              onStatusAction={() => {}}
            />
            <ListPagination
              page={query.page}
              pageSize={query.pageSize}
              totalPages={membersMeta.totalPages}
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

      <AddTeamMemberDialog
        teamId={teamId}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onCreated={refetch}
      />
    </div>
  );
};
