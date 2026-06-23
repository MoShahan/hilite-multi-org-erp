import type { RootState } from "@/app/store";

export const selectLeads = (state: RootState) => state.leads.leads;

export const selectLeadsListMeta = (state: RootState) => state.leads.listMeta;

export const selectLeadsListStatus = (state: RootState) => state.leads.listStatus;

export const selectLeadsListError = (state: RootState) => state.leads.listError;

export const selectSelectedLead = (state: RootState) => state.leads.selectedLead;

export const selectLeadDetailStatus = (state: RootState) =>
  state.leads.detailStatus;

export const selectLeadDetailError = (state: RootState) =>
  state.leads.detailError;

export const selectActivities = (state: RootState) => state.leads.activities;

export const selectActivitiesStatus = (state: RootState) =>
  state.leads.activitiesStatus;

export const selectIsLeadsMutating = (state: RootState) =>
  state.leads.mutationStatus === "loading";
