import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { notificationsService } from "./notificationsService";
import { toNotificationListApiParams } from "./notificationListParams";

import type { NotificationListQuery, NotificationsState } from "./notificationsTypes";

const initialState: NotificationsState = {
  notifications: [],
  listMeta: null,
  listQuery: null,
  unreadCount: 0,
  listStatus: "idle",
  unreadStatus: "idle",
  listError: null,
  mutationStatus: "idle",
  lastFetchedAt: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (query?: NotificationListQuery) =>
    notificationsService.listNotifications(
      query ? toNotificationListApiParams(query) : undefined,
    ),
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async () => notificationsService.getUnreadCount(),
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (notificationId: string) =>
    notificationsService.markRead(notificationId),
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async () => notificationsService.markAllRead(),
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listQuery = action.meta.arg ?? null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.listMeta = action.payload.meta;
        state.unreadCount = action.payload.meta.unreadCount;
        state.listStatus = "success";
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError =
          action.error.message ?? "Failed to load notifications";
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.unreadStatus = "loading";
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
        state.unreadStatus = "success";
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.unreadStatus = "error";
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        const index = state.notifications.findIndex(
          (notification) => notification.id === action.payload.id,
        );
        const wasUnread =
          index !== -1 && !state.notifications[index]?.readAt;
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        if (wasUnread && action.payload.readAt) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state) => {
        state.mutationStatus = "idle";
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.mutationStatus = "idle";
        state.unreadCount = 0;
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? new Date().toISOString(),
        }));
      })
      .addCase(markAllNotificationsRead.rejected, (state) => {
        state.mutationStatus = "idle";
      });
  },
});

export const notificationsReducer = notificationsSlice.reducer;
