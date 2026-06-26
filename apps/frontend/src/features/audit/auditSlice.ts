import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { auditService } from "./auditService";

import type { AuditListQuery, AuditState } from "./auditTypes";

const initialState: AuditState = {
  auditLogs: [],
  listMeta: null,
  listQuery: null,
  listStatus: "idle",
  listError: null,
};

export const fetchAuditLogs = createAsyncThunk(
  "audit/fetchAuditLogs",
  async (query: AuditListQuery) => auditService.listAuditLogs(query),
);

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listQuery = action.meta.arg;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.auditLogs;
        state.listMeta = action.payload.meta;
        state.listStatus = "success";
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError = action.error.message ?? "Failed to load audit trail";
      });
  },
});

export const auditReducer = auditSlice.reducer;
