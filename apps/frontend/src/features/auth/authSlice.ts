import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { authService } from "./authService";

import type { AuthState, LoginCredentials } from "./authTypes";

const initialState: AuthState = {
  user: null,
  organization: null,
  modules: [],
  status: "idle",
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  return authService.fetchMe();
});

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch }) => {
    await authService.login(credentials);
    await dispatch(fetchMe()).unwrap();
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    // Best-effort: cookies may already be invalid after refresh failure.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.modules = action.payload.modules;
        state.status = "authenticated";
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.organization = null;
        state.modules = [];
        state.status = "unauthenticated";
      })
      .addCase(login.fulfilled, (state) => {
        state.status = "authenticated";
      })
      .addCase(login.rejected, (state) => {
        state.status = "unauthenticated";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.organization = null;
        state.modules = [];
        state.status = "unauthenticated";
      });
  },
});

export const authReducer = authSlice.reducer;
