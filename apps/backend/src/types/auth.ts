import type {
  OrganizationStatus,
  UserRole,
  UserStatus,
} from "../generated/prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string | null;
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
};

export type AuthMeResponse = {
  user: AuthUser;
  organization: AuthOrganization | null;
  modules: string[];
};
