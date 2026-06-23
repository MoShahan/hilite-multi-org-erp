import type { RootState } from "@/app/store";

export const selectUsers = (state: RootState) => state.users.users;

export const selectUsersListMeta = (state: RootState) => state.users.listMeta;

export const selectUsersListStatus = (state: RootState) =>
  state.users.listStatus;

export const selectUsersListError = (state: RootState) => state.users.listError;

export const selectUsersMutationStatus = (state: RootState) =>
  state.users.mutationStatus;

export const selectIsUsersMutating = (state: RootState) =>
  state.users.mutationStatus === "loading";
