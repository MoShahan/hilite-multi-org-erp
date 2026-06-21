export type UserRole =
  | "PLATFORM_ADMIN"
  | "ORG_ADMIN"
  | "EXECUTIVE"
  | "TEAM_LEAD"
  | "SALES_MANAGER"
  | "DIRECTOR";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string | null;
};

export type Organization = {
  id: string;
  name: string;
  code: string;
  status: OrganizationStatus;
};

export type AuthMeResponse = {
  user: User;
  organization: Organization | null;
  modules: string[];
};

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type AuthState = {
  user: User | null;
  organization: Organization | null;
  modules: string[];
  status: AuthStatus;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
