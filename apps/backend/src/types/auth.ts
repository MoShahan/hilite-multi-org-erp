import type { OrganizationStatus, UserStatus } from "../generated/prisma/client";

export type AuthRole = {
  id: string;
  name: string;
  slug: string;
};

export type AuthTeam = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  status: UserStatus;
  organizationId: string | null;
  role: AuthRole | null;
  permissions: string[];
  team: AuthTeam | null;
};

export type AuthOrganization = {
  id: string;
  name: string;
  code: string;
  status: OrganizationStatus;
};

export type AuthContext = {
  user: AuthUser;
  organization: AuthOrganization | null;
  modules: string[];
};

export type AuthMeResponse = {
  user: AuthUser;
  organization: AuthOrganization | null;
  modules: string[];
};

export type UpdateProfileInput = {
  name: string;
  phoneNumber?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
