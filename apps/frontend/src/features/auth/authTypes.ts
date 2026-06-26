export type AuthRole = {
  id: string;
  name: string;
  slug: string;
};

export type AuthTeam = {
  id: string;
  name: string;
};

export type UserStatus = "ACTIVE" | "INACTIVE";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED";

export type User = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  role: AuthRole | null;
  permissions: string[];
  status: UserStatus;
  organizationId: string | null;
  team: AuthTeam | null;
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
