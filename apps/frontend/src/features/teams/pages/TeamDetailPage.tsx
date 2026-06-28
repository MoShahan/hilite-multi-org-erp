import { ArrowLeft, Plus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSIONS } from "@/constants/permissions";
import {
  selectAuthUser,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { rolesService } from "@/features/roles/rolesService";
import { UpdateUserStatusDialog } from "@/features/users/components/UpdateUserStatusDialog";
import { updateUserStatus } from "@/features/users/usersSlice";
import { selectIsUsersMutating } from "@/features/users/usersSelectors";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

import { AddTeamMemberDialog } from "../components/AddTeamMemberDialog";
import { TeamMembersListToolbar } from "../components/TeamMembersListToolbar";
import { TeamMembersTable } from "../components/TeamMembersTable";
import { useTeamMemberListQuery } from "../hooks/useTeamMemberListQuery";
import { hasActiveMemberListFilters } from "../teamMemberListParams";
import { clearSelectedTeam, fetchTeam } from "../teamsSlice";
import {
  selectSelectedTeam,
  selectTeamDetailError,
  selectTeamDetailStatus,
  selectTeamMembers,
  selectTeamMembersError,
  selectTeamMembersMeta,
  selectTeamMembersStatus,
} from "../teamsSelectors";

import type { TeamMember, TeamMemberRoleOption } from "../teamsTypes";

type ApiRejection = {
  message: string;
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

export const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const canAddMember = useAppSelector(selectHasPermission(PERMISSIONS.TEAMS_WRITE));
  const canManageStatus = useAppSelector(selectHasPermission(PERMISSIONS.USERS_WRITE));
  const currentUser = useAppSelector(selectAuthUser);
  const isUpdatingStatus = useAppSelector(selectIsUsersMutating);

  const team = useAppSelector(selectSelectedTeam);
  const detailStatus = useAppSelector(selectTeamDetailStatus);
  const detailError = useAppSelector(selectTeamDetailError);
  const members = useAppSelector(selectTeamMembers);
  const membersMeta = useAppSelector(selectTeamMembersMeta);
  const membersStatus = useAppSelector(selectTeamMembersStatus);
  const membersError = useAppSelector(selectTeamMembersError);

  const { query, patchQuery, clearFilters, refetch } = useTeamMemberListQuery(id);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [roles, setRoles] = useState<TeamMemberRoleOption[]>([]);

  const listSearch =
    (location.state as { listSearch?: string } | null)?.listSearch ?? "";

  useEffect(() => {
    if (!id) return;

    void dispatch(fetchTeam(id));

    return () => {
      dispatch(clearSelectedTeam());
    };
  }, [dispatch, id]);

  useEffect(() => {
    void rolesService
      .listRoles({ assignableFrom: "team" })
      .then((result) =>
        setRoles(result.map((role) => ({ id: role.id, name: role.name }))),
      )
      .catch(() => setRoles([]));
  }, []);

  const refetchAll = () => {
    if (id) {
      void dispatch(fetchTeam(id));
    }
    refetch();
  };

  const handleStatusAction = (member: TeamMember) => {
    setSelectedMember(member);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedMember) {
      return;
    }

    const nextStatus =
      selectedMember.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await dispatch(
        updateUserStatus({
          userId: selectedMember.id,
          input: { status: nextStatus },
        }),
      ).unwrap();

      toast.success(
        nextStatus === "INACTIVE" ? "User deactivated" : "User activated",
      );
      setStatusDialogOpen(false);
      setSelectedMember(null);
      refetch();
    } catch (error) {
      toast.error(
        isApiRejection(error)
          ? error.message
          : "Failed to update user status",
      );
    }
  };

  const handleSortChange = (
    sortBy: typeof query.sortBy,
    sortOrder: typeof query.sortOrder,
  ) => {
    patchQuery({ sortBy, sortOrder, page: 1 });
  };

  const isDetailLoading =
    detailStatus === "idle" || detailStatus === "loading";
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
      : team
        ? `${team.memberCount} ${team.memberCount === 1 ? "member" : "members"}`
        : "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to={`/teams${listSearch}`}>
            <ArrowLeft className="size-4" />
            Teams
          </Link>
        </Button>
      </div>

      {detailStatus === "error" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {detailError ?? "Failed to load team."}
        </div>
      ) : null}

      {isDetailLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
        </div>
      ) : null}

      {!isDetailLoading && team ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UsersRound className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {team.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {memberCountLabel}
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
                {Array.from({ length: query.pageSize }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : null}

            {showGlobalEmpty ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
                <p className="font-medium">No members yet</p>
                <p className="text-sm text-muted-foreground">
                  Add team-scoped users to this team.
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
                  canManageStatus={canManageStatus}
                  currentUserId={currentUser?.id}
                  onSortChange={handleSortChange}
                  onStatusAction={handleStatusAction}
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

          {id ? (
            <AddTeamMemberDialog
              teamId={id}
              open={addMemberOpen}
              onOpenChange={setAddMemberOpen}
              onCreated={refetchAll}
            />
          ) : null}

          {selectedMember ? (
            <UpdateUserStatusDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
              userName={selectedMember.name}
              currentStatus={selectedMember.status}
              isSubmitting={isUpdatingStatus}
              onConfirm={handleConfirmStatusChange}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};
