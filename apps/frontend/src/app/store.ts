import { configureStore } from "@reduxjs/toolkit";

import { auditReducer } from "@/features/audit/auditSlice";
import { authReducer } from "@/features/auth/authSlice";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";
import { leadsReducer } from "@/features/leads/leadsSlice";
import { notificationsReducer } from "@/features/notifications/notificationsSlice";
import { platformReducer } from "@/features/platform/platformSlice";
import { teamsReducer } from "@/features/teams/teamsSlice";
import { usersReducer } from "@/features/users/usersSlice";

/**
 * Feature slice pattern (add per module under src/features/<feature>/):
 *
 * 1. <feature>Service.ts  — HTTP calls via apiClient (no Redux)
 * 2. <feature>Slice.ts    — createSlice + createAsyncThunk wrapping the service
 * 3. <feature>Selectors.ts — memoized selectors for derived state
 * 4. Register the reducer below: `<feature>: featureReducer`
 *
 * Components use useAppDispatch / useAppSelector from @/app/hooks.
 * Keep local form/UI state in components; use Redux for shared global state only.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    platform: platformReducer,
    teams: teamsReducer,
    users: usersReducer,
    leads: leadsReducer,
    notifications: notificationsReducer,
    audit: auditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
