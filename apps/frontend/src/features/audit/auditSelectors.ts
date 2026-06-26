import type { RootState } from "@/app/store";

export const selectAuditLogs = (state: RootState) => state.audit.auditLogs;

export const selectAuditListMeta = (state: RootState) => state.audit.listMeta;

export const selectAuditListStatus = (state: RootState) =>
  state.audit.listStatus;

export const selectAuditListError = (state: RootState) => state.audit.listError;
