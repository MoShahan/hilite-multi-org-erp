import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { ApiClientError } from "@/lib/api-client";

import { platformService } from "./platformService";

import type {
  CreateOrganizationInput,
  OrganizationListQuery,
  PlatformAuditListQuery,
  PlatformState,
  UpdateOrganizationInput,
} from "./platformTypes";

const initialState: PlatformState = {
  organizations: [],
  listMeta: null,
  listQuery: null,
  listStatus: "idle",
  listError: null,
  selectedOrganization: null,
  detailStatus: "idle",
  detailError: null,
  mutationStatus: "idle",
  auditLogs: [],
  auditListMeta: null,
  auditListQuery: null,
  auditListStatus: "idle",
  auditListError: null,
};

export const fetchOrganizations = createAsyncThunk(
  "platform/fetchOrganizations",
  async (query: OrganizationListQuery) =>
    platformService.listOrganizations(query),
);

export const fetchOrganization = createAsyncThunk(
  "platform/fetchOrganization",
  async (id: string) => platformService.getOrganization(id),
);

export const createOrganization = createAsyncThunk(
  "platform/createOrganization",
  async (input: CreateOrganizationInput, { rejectWithValue }) => {
    try {
      return await platformService.createOrganization(input);
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

export const updateOrganization = createAsyncThunk(
  "platform/updateOrganization",
  async (
    {
      id,
      input,
    }: {
      id: string;
      input: UpdateOrganizationInput;
    },
    { rejectWithValue },
  ) => {
    try {
      return await platformService.updateOrganization(id, input);
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

export const updateOrganizationStatus = createAsyncThunk(
  "platform/updateOrganizationStatus",
  async ({
    id,
    status,
  }: {
    id: string;
    status: "ACTIVE" | "SUSPENDED";
  }) => platformService.updateOrganizationStatus(id, status),
);

export const fetchPlatformAuditLogs = createAsyncThunk(
  "platform/fetchPlatformAuditLogs",
  async (query: PlatformAuditListQuery) =>
    platformService.listAuditLogs(query),
);

const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    clearSelectedOrganization: (state) => {
      state.selectedOrganization = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listQuery = action.meta.arg;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload.organizations;
        state.listMeta = action.payload.meta;
        state.listStatus = "success";
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError =
          action.error.message ?? "Failed to load organizations";
      })
      .addCase(fetchOrganization.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.selectedOrganization = action.payload;
        state.detailStatus = "success";
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.detailStatus = "error";
        state.detailError =
          action.error.message ?? "Failed to load organization";
        state.selectedOrganization = null;
      })
      .addCase(createOrganization.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createOrganization.fulfilled, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createOrganization.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(updateOrganization.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.selectedOrganization = action.payload;
        state.organizations = state.organizations.map((organization) =>
          organization.id === action.payload.id ? action.payload : organization,
        );
      })
      .addCase(updateOrganization.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(updateOrganizationStatus.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateOrganizationStatus.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.selectedOrganization = action.payload;
        state.organizations = state.organizations.map((organization) =>
          organization.id === action.payload.id ? action.payload : organization,
        );
      })
      .addCase(updateOrganizationStatus.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(fetchPlatformAuditLogs.pending, (state, action) => {
        state.auditListStatus = "loading";
        state.auditListError = null;
        state.auditListQuery = action.meta.arg;
      })
      .addCase(fetchPlatformAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.auditLogs;
        state.auditListMeta = action.payload.meta;
        state.auditListStatus = "success";
      })
      .addCase(fetchPlatformAuditLogs.rejected, (state, action) => {
        state.auditListStatus = "error";
        state.auditListError =
          action.error.message ?? "Failed to load platform audit trail";
      });
  },
});

export const { clearSelectedOrganization } = platformSlice.actions;
export const platformReducer = platformSlice.reducer;
