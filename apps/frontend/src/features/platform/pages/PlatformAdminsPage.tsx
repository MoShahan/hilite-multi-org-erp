import { Plus, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthUser,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { UpdateUserStatusDialog } from "@/features/users/components/UpdateUserStatusDialog";
import { PERMISSIONS } from "@/constants/permissions";
import { PAGE_SIZE_OPTIONS, TABLE_SKELETON_ROW_COUNT } from "@/lib/pagination";

import { CreatePlatformAdminDialog } from "../components/CreatePlatformAdminDialog";
import { PlatformAdminsListToolbar } from "../components/PlatformAdminsListToolbar";
import { PlatformAdminsTable } from "../components/PlatformAdminsTable";
import { usePlatformUserListQuery } from "../hooks/usePlatformUserListQuery";
import { hasActivePlatformUserListFilters } from "../platformUserListParams";
import { updatePlatformUserStatus } from "../platformSlice";
import {
  selectIsPlatformMutating,
  selectPlatformUsers,
  selectPlatformUsersListError,
  selectPlatformUsersListMeta,
  selectPlatformUsersListStatus,
} from "../platformSelectors";

import type { PlatformUser } from "../platformTypes";

type ApiRejection = {
  message: string;
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

export const PlatformAdminsPage = () => {
  const dispatch = useAppDispatch();
  const canManage = useAppSelector(
    selectHasPermission(PERMISSIONS.PLATFORM_USERS_WRITE),
  );
  const currentUser = useAppSelector(selectAuthUser);
  const isUpdatingStatus = useAppSelector(selectIsPlatformMutating);
  const { query, patchQuery, clearFilters, refetch } = usePlatformUserListQuery();

  const users = useAppSelector(selectPlatformUsers);
  const listMeta = useAppSelector(selectPlatformUsersListMeta);
  const listStatus = useAppSelector(selectPlatformUsersListStatus);
  const listError = useAppSelector(selectPlatformUsersListError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  const isLoading = listStatus === "idle" || listStatus === "loading";
  const total = listMeta?.total ?? 0;
  const hasFilters = hasActivePlatformUserListFilters(query);
  const showFilteredEmpty =
    !isLoading && listStatus === "success" && total === 0 && hasFilters;
  const showGlobalEmpty =
    !isLoading && listStatus === "success" && total === 0 && !hasFilters;

  const handleStatusAction = (user: PlatformUser) => {
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
        updatePlatformUserStatus({
          userId: selectedUser.id,
          input: { status: nextStatus },
        }),
      ).unwrap();

      toast.success(
        nextStatus === "INACTIVE"
          ? "Platform admin deactivated"
          : "Platform admin activated",
      );
      setStatusDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error(
        isApiRejection(error)
          ? error.message
          : "Failed to update platform admin status",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Platform admins
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage platform administrator accounts.
            </p>
          </div>
        </div>

        {canManage ? (
          <Button
            type="button"
            className="shadow-sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add platform admin
          </Button>
        ) : null}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <PlatformAdminsListToolbar
          query={query}
          total={total}
          onQueryChange={patchQuery}
        />

        {listStatus === "error" ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {listError ?? "Failed to load platform admins."}
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
              <Shield className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No platform admins yet</p>
              <p className="text-sm text-muted-foreground">
                Create the first platform administrator account.
              </p>
            </div>
            {canManage ? (
              <Button type="button" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Add platform admin
              </Button>
            ) : null}
          </div>
        ) : null}

        {showFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <div>
              <p className="font-medium">No platform admins match your filters</p>
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
            <PlatformAdminsTable
              users={users}
              sortBy={query.sortBy}
              sortOrder={query.sortOrder}
              canManageStatus={canManage}
              currentUserId={currentUser?.id}
              onSortChange={(sortBy, sortOrder) =>
                patchQuery({ sortBy, sortOrder, page: 1 })
              }
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

      <CreatePlatformAdminDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={refetch}
      />

      {selectedUser ? (
        <UpdateUserStatusDialog
          open={statusDialogOpen}
          onOpenChange={(open) => {
            setStatusDialogOpen(open);

            if (!open) {
              setSelectedUser(null);
            }
          }}
          userName={selectedUser.name}
          currentStatus={selectedUser.status}
          isSubmitting={isUpdatingStatus}
          onConfirm={() => void handleConfirmStatusChange()}
        />
      ) : null}
    </div>
  );
};
