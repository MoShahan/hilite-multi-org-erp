import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toTeamListApiParams } from "./teamListParams";
import { toTeamMemberListApiParams } from "./teamMemberListParams";

import type {
  CreateTeamInput,
  CreateTeamMemberInput,
  ListTeamMembersResult,
  ListTeamOptionsQuery,
  ListTeamsResult,
  Team,
  TeamListQuery,
  TeamMember,
  TeamMemberListQuery,
  TeamOptionsResult,
} from "./teamsTypes";

export const teamsService = {
  listTeams: async (query: TeamListQuery): Promise<ListTeamsResult> => {
    const response = await apiClient.get("/api/v1/teams", {
      params: toTeamListApiParams(query),
    });
    return unwrapResponse<ListTeamsResult>(response);
  },

  listTeamOptions: async (
    query: ListTeamOptionsQuery = {},
  ): Promise<TeamOptionsResult> => {
    const response = await apiClient.get("/api/v1/teams/options", {
      params: query.search ? { search: query.search } : undefined,
    });
    return unwrapResponse<TeamOptionsResult>(response);
  },

  getTeam: async (id: string): Promise<Team> => {
    const response = await apiClient.get(`/api/v1/teams/${id}`);
    const data = unwrapResponse<{ team: Team }>(response);
    return data.team;
  },

  createTeam: async (input: CreateTeamInput): Promise<Team> => {
    const response = await apiClient.post("/api/v1/teams", input);
    const data = unwrapResponse<{ team: Team }>(response);
    return data.team;
  },

  listMembers: async (
    teamId: string,
    query: TeamMemberListQuery,
  ): Promise<ListTeamMembersResult> => {
    const response = await apiClient.get(`/api/v1/teams/${teamId}/members`, {
      params: toTeamMemberListApiParams(query),
    });
    return unwrapResponse<ListTeamMembersResult>(response);
  },

  createMember: async (
    teamId: string,
    input: CreateTeamMemberInput,
  ): Promise<TeamMember> => {
    const response = await apiClient.post(
      `/api/v1/teams/${teamId}/members`,
      input,
    );
    const data = unwrapResponse<{ member: TeamMember }>(response);
    return data.member;
  },
};
