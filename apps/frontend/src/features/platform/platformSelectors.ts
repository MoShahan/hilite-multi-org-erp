import type { RootState } from "@/app/store";

export const selectOrganizations = (state: RootState) =>
  state.platform.organizations;

export const selectOrganizationsListMeta = (state: RootState) =>
  state.platform.listMeta;

export const selectOrganizationsListQuery = (state: RootState) =>
  state.platform.listQuery;

export const selectOrganizationsListStatus = (state: RootState) =>
  state.platform.listStatus;

export const selectOrganizationsListError = (state: RootState) =>
  state.platform.listError;

export const selectSelectedOrganization = (state: RootState) =>
  state.platform.selectedOrganization;

export const selectOrganizationDetailStatus = (state: RootState) =>
  state.platform.detailStatus;

export const selectOrganizationDetailError = (state: RootState) =>
  state.platform.detailError;

export const selectPlatformMutationStatus = (state: RootState) =>
  state.platform.mutationStatus;

export const selectIsPlatformMutating = (state: RootState) =>
  state.platform.mutationStatus === "loading";

export const selectPlatformAuditLogs = (state: RootState) =>
  state.platform.auditLogs;

export const selectPlatformAuditListMeta = (state: RootState) =>
  state.platform.auditListMeta;

export const selectPlatformAuditListStatus = (state: RootState) =>
  state.platform.auditListStatus;

export const selectPlatformAuditListError = (state: RootState) =>
  state.platform.auditListError;
