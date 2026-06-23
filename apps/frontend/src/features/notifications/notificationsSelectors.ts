import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";

export const selectNotifications = (state: RootState) =>
  state.notifications.notifications;

export const selectNotificationsListMeta = (state: RootState) =>
  state.notifications.listMeta;

export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;

export const selectNotificationsListStatus = (state: RootState) =>
  state.notifications.listStatus;

export const selectNotificationsListError = (state: RootState) =>
  state.notifications.listError;

export const selectNotificationsMutationStatus = (state: RootState) =>
  state.notifications.mutationStatus;

export const selectHasUnreadNotifications = createSelector(
  selectUnreadCount,
  (count) => count > 0,
);
