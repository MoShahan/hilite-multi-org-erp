import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { ApiClientError } from "@/lib/api-client";

import { leadsService } from "./leadsService";

import type {
  AssignLeadInput,
  CreateActivityInput,
  CreateLeadInput,
  LeadListQuery,
  LeadsState,
  UpdateLeadInput,
} from "./leadsTypes";

const initialState: LeadsState = {
  leads: [],
  listMeta: null,
  listQuery: null,
  listStatus: "idle",
  listError: null,
  selectedLead: null,
  detailStatus: "idle",
  detailError: null,
  activities: [],
  activitiesMeta: null,
  activitiesStatus: "idle",
  statusHistory: [],
  statusHistoryStatus: "idle",
  mutationStatus: "idle",
};

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (query: LeadListQuery) => leadsService.listLeads(query),
);

export const fetchLead = createAsyncThunk(
  "leads/fetchLead",
  async (leadId: string) => leadsService.getLead(leadId),
);

export const createLead = createAsyncThunk(
  "leads/createLead",
  async (input: CreateLeadInput, { rejectWithValue }) => {
    try {
      return await leadsService.createLead(input);
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

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (
    { leadId, input }: { leadId: string; input: UpdateLeadInput },
    { rejectWithValue },
  ) => {
    try {
      return await leadsService.updateLead(leadId, input);
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

export const assignLead = createAsyncThunk(
  "leads/assignLead",
  async (
    { leadId, input }: { leadId: string; input: AssignLeadInput },
    { rejectWithValue },
  ) => {
    try {
      return await leadsService.assignLead(leadId, input);
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

export const fetchActivities = createAsyncThunk(
  "leads/fetchActivities",
  async (leadId: string) => leadsService.listActivities(leadId),
);

export const fetchStatusHistory = createAsyncThunk(
  "leads/fetchStatusHistory",
  async (leadId: string) => leadsService.listStatusHistory(leadId),
);

export const createActivity = createAsyncThunk(
  "leads/createActivity",
  async (
    { leadId, input }: { leadId: string; input: CreateActivityInput },
    { rejectWithValue },
  ) => {
    try {
      return await leadsService.createActivity(leadId, input);
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

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    clearSelectedLead: (state) => {
      state.selectedLead = null;
      state.detailStatus = "idle";
      state.detailError = null;
      state.activities = [];
      state.activitiesMeta = null;
      state.activitiesStatus = "idle";
      state.statusHistory = [];
      state.statusHistoryStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listQuery = action.meta.arg;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.leads = action.payload.leads;
        state.listMeta = action.payload.meta;
        state.listStatus = "success";
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError = action.error.message ?? "Failed to load leads";
      })
      .addCase(fetchLead.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.selectedLead = action.payload;
        state.detailStatus = "success";
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.detailStatus = "error";
        state.detailError = action.error.message ?? "Failed to load lead";
      })
      .addCase(createLead.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createLead.fulfilled, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createLead.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(updateLead.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.selectedLead = action.payload;
        const index = state.leads.findIndex(
          (lead) => lead.id === action.payload.id,
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(updateLead.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(assignLead.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(assignLead.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.selectedLead = action.payload;
        const index = state.leads.findIndex(
          (lead) => lead.id === action.payload.id,
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(assignLead.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesStatus = "loading";
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload.activities;
        state.activitiesMeta = action.payload.meta;
        state.activitiesStatus = "success";
      })
      .addCase(fetchActivities.rejected, (state) => {
        state.activitiesStatus = "error";
      })
      .addCase(fetchStatusHistory.pending, (state) => {
        state.statusHistoryStatus = "loading";
      })
      .addCase(fetchStatusHistory.fulfilled, (state, action) => {
        state.statusHistory = action.payload.entries;
        state.statusHistoryStatus = "success";
      })
      .addCase(fetchStatusHistory.rejected, (state) => {
        state.statusHistoryStatus = "error";
      })
      .addCase(createActivity.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.activities = [action.payload, ...state.activities];
        if (state.activitiesMeta) {
          state.activitiesMeta.total += 1;
        }
      })
      .addCase(createActivity.rejected, (state) => {
        state.mutationStatus = "idle";
      });
  },
});

export const { clearSelectedLead } = leadsSlice.actions;
export const leadsReducer = leadsSlice.reducer;
