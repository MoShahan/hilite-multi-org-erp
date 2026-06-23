import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { ApiClientError } from "@/lib/api-client";

import { usersService } from "./usersService";

import type {
  CreateUserInput,
  UpdateUserStatusInput,
  UserListQuery,
  UsersState,
} from "./usersTypes";

const initialState: UsersState = {
  users: [],
  listMeta: null,
  listQuery: null,
  listStatus: "idle",
  listError: null,
  mutationStatus: "idle",
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (query: UserListQuery) => usersService.listUsers(query),
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (input: CreateUserInput, { rejectWithValue }) => {
    try {
      return await usersService.createUser(input);
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

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async (
    { userId, input }: { userId: string; input: UpdateUserStatusInput },
    { rejectWithValue },
  ) => {
    try {
      return await usersService.updateUserStatus(userId, input);
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

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listQuery = action.meta.arg;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.listMeta = action.payload.meta;
        state.listStatus = "success";
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError = action.error.message ?? "Failed to load users";
      })
      .addCase(createUser.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createUser.fulfilled, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(createUser.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserStatus.rejected, (state) => {
        state.mutationStatus = "idle";
      });
  },
});

export const usersReducer = usersSlice.reducer;
