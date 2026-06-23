import type { OrgModuleKey } from "@/constants/orgModules";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED";

export type OrganizationListStatusFilter = OrganizationStatus | "ALL";

export type OrganizationListSortBy =
  | "name"
  | "code"
  | "status"
  | "userCount"
  | "createdAt";

export type OrganizationListSortOrder = "asc" | "desc";

export type OrganizationListQuery = {
  search: string;
  status: OrganizationListStatusFilter;
  sortBy: OrganizationListSortBy;
  sortOrder: OrganizationListSortOrder;
  page: number;
  pageSize: number;
};

export type OrganizationListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Organization = {
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

export type ListOrganizationsResult = {
  organizations: Organization[];
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

export type OrgModuleCatalogItem = {
  key: OrgModuleKey;
  label: string;
  description: string;
  disableHint: string;
};

export type OrganizationModulesMap = Record<OrgModuleKey, boolean>;

export type OrganizationModulesResponse = {
  modules: OrganizationModulesMap;
  catalog: OrgModuleCatalogItem[];
};

export type PlatformState = {
  organizations: Organization[];
  listMeta: OrganizationListMeta | null;
  listQuery: OrganizationListQuery | null;
  listStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
  selectedOrganization: Organization | null;
  detailStatus: "idle" | "loading" | "success" | "error";
  detailError: string | null;
  mutationStatus: "idle" | "loading";
};
