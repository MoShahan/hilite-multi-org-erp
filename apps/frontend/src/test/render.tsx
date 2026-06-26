import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { authReducer } from "@/features/auth/authSlice";
import { auditReducer } from "@/features/audit/auditSlice";
import { dashboardReducer } from "@/features/dashboard/dashboardSlice";
import { leadsReducer } from "@/features/leads/leadsSlice";
import { notificationsReducer } from "@/features/notifications/notificationsSlice";
import { platformReducer } from "@/features/platform/platformSlice";
import { teamsReducer } from "@/features/teams/teamsSlice";
import { usersReducer } from "@/features/users/usersSlice";

import type { RootState } from "@/app/store";
import type { ReactElement, ReactNode } from "react";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const createTestStore = (preloadedState?: DeepPartial<RootState>) =>
  configureStore({
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
    preloadedState: preloadedState as RootState,
  });

type RenderWithProvidersOptions = {
  preloadedState?: DeepPartial<RootState>;
  route?: string;
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
};

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    route = "/",
    wrapper: Wrapper,
  }: RenderWithProvidersOptions = {},
) => {
  const store = createTestStore(preloadedState);

  const content = Wrapper ? <Wrapper>{ui}</Wrapper> : ui;

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
      </Provider>,
    ),
  };
};
