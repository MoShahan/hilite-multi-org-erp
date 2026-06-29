import type { RootState } from "@/app/store";
import type { AuthState, User } from "@/features/auth/authTypes";

export const asRootState = (partial: Partial<RootState>): RootState =>
  partial as RootState;

export const mockUser = (overrides?: Partial<User>): User => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  phoneNumber: null,
  role: { id: "role-1", name: "Org Admin", slug: "org_admin" },
  permissions: ["users:read", "teams:read"],
  status: "ACTIVE",
  team: null,
  ...overrides,
});

export const mockAuthState = (overrides?: Partial<AuthState>): AuthState => ({
  user: null,
  organization: null,
  modules: [],
  status: "idle",
  ...overrides,
});

export const authenticatedState = (
  overrides?: Partial<AuthState>,
): Pick<RootState, "auth"> => ({
  auth: mockAuthState({
    user: mockUser(),
    organization: {
      id: "org-1",
      name: "Test Org",
      code: "TEST",
      status: "ACTIVE",
    },
    modules: ["sales_erp", "dashboards"],
    status: "authenticated",
    ...overrides,
  }),
});

export const platformAdminState = (): Pick<RootState, "auth"> => ({
  auth: mockAuthState({
    user: mockUser({
      permissions: ["platform:orgs:read"],
    }),
    status: "authenticated",
  }),
});
