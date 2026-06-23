import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { ApiClientError } from "@/lib/api-client";

import { teamsService } from "./teamsService";

import type {
  CreateTeamInput,
  CreateTeamMemberInput,
  TeamListQuery,
  TeamMemberListQuery,
  TeamsState,
} from "./teamsTypes";

const initialState: TeamsState = {
  teams: [],
  listMeta: null,
  listStatus: "idle",
  listError: null,
  selectedTeam: null,
  detailStatus: "idle",
  detailError: null,
  members: [],
  membersMeta: null,
  membersStatus: "idle",
  membersError: null,
  mutationStatus: "idle",
};

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (query: TeamListQuery) => teamsService.listTeams(query),
);

export const fetchTeam = createAsyncThunk(
  "teams/fetchTeam",
  async (teamId: string) => teamsService.getTeam(teamId),
);

export const fetchTeamMembers = createAsyncThunk(
  "teams/fetchTeamMembers",
  async ({
    teamId,
    query,
  }: {
    teamId: string;
    query: TeamMemberListQuery;
  }) => teamsService.listMembers(teamId, query),
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (input: CreateTeamInput, { rejectWithValue }) => {
    try {
      return await teamsService.createTeam(input);
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue({
          message: error.message,
          details: error.details,
        });
      }
      throw error;
    }
  },
);

export const createTeamMember = createAsyncThunk(
  "teams/createTeamMember",
  async (
    { teamId, input }: { teamId: string; input: CreateTeamMemberInput },
    { rejectWithValue },
  ) => {
    try {
      return await teamsService.createMember(teamId, input);
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue({
          message: error.message,
          details: error.details,
        });
      }
      throw error;
    }
  },
);

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
      state.detailStatus = "idle";
      state.detailError = null;
      state.members = [];
      state.membersMeta = null;
      state.membersStatus = "idle";
      state.membersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload.teams;
        state.listMeta = action.payload.meta;
        state.listStatus = "success";
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError = action.error.message ?? "Failed to load teams";
      })
      .addCase(fetchTeam.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.selectedTeam = action.payload;
        state.detailStatus = "success";
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.detailStatus = "error";
        state.detailError = action.error.message ?? "Failed to load team";
      })
      .addCase(fetchTeamMembers.pending, (state) => {
        state.membersStatus = "loading";
        state.membersError = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.members = action.payload.members;
        state.membersMeta = action.payload.meta;
        state.membersStatus = "success";
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.membersStatus = "error";
        state.membersError =
          action.error.message ?? "Failed to load team members";
      })
      .addCase(createTeam.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createTeam.fulfilled, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createTeam.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createTeamMember.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createTeamMember.fulfilled, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createTeamMember.rejected, (state) => {
        state.mutationStatus = "idle";
      });
  },
});

export const { clearSelectedTeam } = teamsSlice.actions;
export const teamsReducer = teamsSlice.reducer;
