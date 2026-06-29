import type { OrgModuleKey } from "@/constants/orgModules";

import type {
  AuditListMeta,
  AuditLog,
  PlatformAuditListQuery,
} from "@/features/audit/auditTypes";

export type { PlatformAuditListQuery };

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

export type OrganizationOption = {
  id: string;
  name: string;
  code: string;
};

export type OrganizationOptionsResult = {
  organizations: OrganizationOption[];
};

export type ListOrganizationOptionsQuery = {
  status?: OrganizationListStatusFilter;
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
  organizationOptions: OrganizationOption[];
  organizationOptionsStatus: "idle" | "loading" | "success" | "error";
  organizationOptionsError: string | null;
  selectedOrganization: Organization | null;
  detailStatus: "idle" | "loading" | "success" | "error";
  detailError: string | null;
  mutationStatus: "idle" | "loading";
  auditLogs: AuditLog[];
  auditListMeta: AuditListMeta | null;
  auditListQuery: PlatformAuditListQuery | null;
  auditListStatus: "idle" | "loading" | "success" | "error";
  auditListError: string | null;
  platformUsers: PlatformUser[];
  platformUsersListMeta: PlatformUserListMeta | null;
  platformUsersListQuery: PlatformUserListQuery | null;
  platformUsersListStatus: "idle" | "loading" | "success" | "error";
  platformUsersListError: string | null;
};

export type PlatformUserStatus = "ACTIVE" | "INACTIVE";

export type PlatformUserListStatusFilter = PlatformUserStatus | "ALL";

export type PlatformUserListSortBy = "name" | "email" | "status" | "createdAt";

export type PlatformUserListSortOrder = "asc" | "desc";

export type PlatformUserListQuery = {
  search: string;
  status: PlatformUserListStatusFilter;
  sortBy: PlatformUserListSortBy;
  sortOrder: PlatformUserListSortOrder;
  page: number;
  pageSize: number;
};

export type PlatformUserListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  status: PlatformUserStatus;
  createdAt: string;
};

export type ListPlatformUsersResult = {
  users: PlatformUser[];
  meta: PlatformUserListMeta;
};

export type CreatePlatformUserInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdatePlatformUserStatusInput = {
  status: PlatformUserStatus;
};
