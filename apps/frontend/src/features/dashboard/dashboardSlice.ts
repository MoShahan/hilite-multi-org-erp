import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { dashboardService } from "./dashboardService";

import type { DashboardLayoutItem } from "./dashboardLayoutTypes";
import type { DashboardState } from "./dashboardState";

const initialState: DashboardState = {
  summary: null,
  layout: null,
  status: "idle",
  error: null,
  layoutMutationStatus: "idle",
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async () => {
    const [summary, layout] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getLayout(),
    ]);
    return { summary, layout };
  },
);

export const updateDashboardLayout = createAsyncThunk(
  "dashboard/updateDashboardLayout",
  async (widgets: DashboardLayoutItem[]) =>
    dashboardService.updateLayout(widgets),
);

export const resetDashboardLayout = createAsyncThunk(
  "dashboard/resetDashboardLayout",
  async () => dashboardService.resetLayout(),
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "success";
        state.summary = action.payload.summary;
        state.layout = action.payload.layout;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to load dashboard";
      })
      .addCase(updateDashboardLayout.pending, (state) => {
        state.layoutMutationStatus = "loading";
      })
      .addCase(updateDashboardLayout.fulfilled, (state, action) => {
        state.layoutMutationStatus = "idle";
        state.layout = action.payload;
      })
      .addCase(updateDashboardLayout.rejected, (state) => {
        state.layoutMutationStatus = "idle";
      })
      .addCase(resetDashboardLayout.pending, (state) => {
        state.layoutMutationStatus = "loading";
      })
      .addCase(resetDashboardLayout.fulfilled, (state, action) => {
        state.layoutMutationStatus = "idle";
        state.layout = action.payload;
      })
      .addCase(resetDashboardLayout.rejected, (state) => {
        state.layoutMutationStatus = "idle";
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
