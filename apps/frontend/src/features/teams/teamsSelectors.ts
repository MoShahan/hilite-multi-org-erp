import type { RootState } from "@/app/store";

export const selectTeams = (state: RootState) => state.teams.teams;
export const selectTeamsListMeta = (state: RootState) => state.teams.listMeta;
export const selectTeamsListStatus = (state: RootState) =>
  state.teams.listStatus;
export const selectTeamsListError = (state: RootState) =>
  state.teams.listError;
export const selectSelectedTeam = (state: RootState) =>
  state.teams.selectedTeam;
export const selectTeamDetailStatus = (state: RootState) =>
  state.teams.detailStatus;
export const selectTeamDetailError = (state: RootState) =>
  state.teams.detailError;
export const selectTeamMembers = (state: RootState) => state.teams.members;
export const selectTeamMembersMeta = (state: RootState) =>
  state.teams.membersMeta;
export const selectTeamMembersStatus = (state: RootState) =>
  state.teams.membersStatus;
export const selectTeamMembersError = (state: RootState) =>
  state.teams.membersError;
export const selectTeamsMutationStatus = (state: RootState) =>
  state.teams.mutationStatus;
