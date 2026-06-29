import { Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
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
import { teamsService } from "@/features/teams/teamsService";
import { ApiClientError } from "@/lib/api-client";
import { PAGE_SIZE_OPTIONS, TABLE_SKELETON_ROW_COUNT } from "@/lib/pagination";

import { CreateUserDialog } from "../components/CreateUserDialog";
import { UpdateUserStatusDialog } from "../components/UpdateUserStatusDialog";
import { UsersListToolbar } from "../components/UsersListToolbar";
import { UsersTable } from "../components/UsersTable";
import { useUserListQuery } from "../hooks/useUserListQuery";
import { hasActiveListFilters } from "../userListParams";
import {
  selectIsUsersMutating,
  selectUsers,
  selectUsersListError,
  selectUsersListMeta,
  selectUsersListStatus,
} from "../usersSelectors";
import { updateUserStatus } from "../usersSlice";

import type {
  OrganizationRoleOption,
  TeamFilterOption,
  User,
} from "../usersTypes";

type ApiRejection = {
  message: string;
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

export const UsersPage = () => {
  const dispatch = useAppDispatch();
  const canCreateUser = useAppSelector(selectHasPermission(PERMISSIONS.USERS_WRITE));
  const canManageStatus = useAppSelector(selectHasPermission(PERMISSIONS.USERS_WRITE));
  const currentUser = useAppSelector(selectAuthUser);
  const isUpdatingStatus = useAppSelector(selectIsUsersMutating);
  const { query, patchQuery, clearFilters, refetch } = useUserListQuery();

  const users = useAppSelector(selectUsers);
  const listMeta = useAppSelector(selectUsersListMeta);
  const listStatus = useAppSelector(selectUsersListStatus);
  const listError = useAppSelector(selectUsersListError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<OrganizationRoleOption[]>([]);
  const [teams, setTeams] = useState<TeamFilterOption[]>([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [rolesResult, teamsResult] = await Promise.all([
          rolesService.listRoleOptions(),
          teamsService.listTeamOptions(),
        ]);
        setRoles(rolesResult.roles);
        setTeams(teamsResult.teams);
      } catch (error) {
        if (error instanceof ApiClientError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load filter options");
        }
      }
    };

    void loadFilterOptions();
  }, []);

  const handleStatusAction = (user: User) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) {
      return;
    }

    const nextStatus =
      selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await dispatch(
        updateUserStatus({
          userId: selectedUser.id,
          input: { status: nextStatus },
        }),
      ).unwrap();

      toast.success(
        nextStatus === "INACTIVE" ? "User deactivated" : "User activated",
      );
      setStatusDialogOpen(false);
      setSelectedUser(null);
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
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage organization users and their roles.
            </p>
          </div>
        </div>
        {canCreateUser ? (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shadow-sm"
          >
            <Plus className="size-4" />
            Add user
          </Button>
        ) : null}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <UsersListToolbar
          query={query}
          total={total}
          roles={roles}
          teams={teams}
          onQueryChange={patchQuery}
        />

        {listStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError ?? "Failed to load users."}
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
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No users yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first organization user to get started.
              </p>
            </div>
            {canCreateUser ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Add user
              </Button>
            ) : null}
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No users match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && users.length > 0 && listMeta ? (
          <>
            <UsersTable
              users={users}
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

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refetch}
      />

      {selectedUser ? (
        <UpdateUserStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          userName={selectedUser.name}
          currentStatus={selectedUser.status}
          isSubmitting={isUpdatingStatus}
          onConfirm={handleConfirmStatusChange}
        />
      ) : null}
    </div>
  );
};
