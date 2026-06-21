import type { OrganizationStatus } from "../generated/prisma/client";

export type OrganizationResponse = {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  description: string | null;
  status: OrganizationStatus;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationListStatusFilter = OrganizationStatus | "ALL";

export type OrganizationListSortBy =
  | "name"
  | "code"
  | "status"
  | "userCount"
  | "createdAt";

export type OrganizationListSortOrder = "asc" | "desc";

export type ListOrganizationsQuery = {
  search?: string;
  status?: OrganizationListStatusFilter;
  sortBy?: OrganizationListSortBy;
  sortOrder?: OrganizationListSortOrder;
  page?: number;
  pageSize?: number;
};

export type OrganizationListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ParsedListOrganizationsQuery = {
  search?: string;
  status: OrganizationListStatusFilter;
  sortBy: OrganizationListSortBy;
  sortOrder: OrganizationListSortOrder;
  page: number;
  pageSize: number;
};

export type PaginatedOrganizationsResponse = {
  organizations: OrganizationResponse[];
  meta: OrganizationListMeta;
};

export type CreateOrganizationOrgAdminInput = {
  name: string;
  email: string;
  password: string;
};

export type CreateOrganizationInput = {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  orgAdmin: CreateOrganizationOrgAdminInput;
};

export type UpdateOrganizationInput = {
  name?: string;
  code?: string;
  description?: string | null;
  logoUrl?: string | null;
};

export type UpdateOrganizationStatusInput = {
  status: OrganizationStatus;
};
