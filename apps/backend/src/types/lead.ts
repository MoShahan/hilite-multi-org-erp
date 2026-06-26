import type { LeadStatus } from "../generated/prisma/client";

export type LeadUserSummary = {
  id: string;
  name: string;
  email: string;
};

export type LeadTeamSummary = {
  id: string;
  name: string;
};

export type LeadResponse = {
  id: string;
  name: string;
  mobileNumber: string | null;
  email: string | null;
  source: string | null;
  project: string | null;
  status: LeadStatus;
  team: LeadTeamSummary;
  assignedTo: LeadUserSummary | null;
  createdBy: LeadUserSummary;
  createdAt: string;
  updatedAt: string;
};

export type LeadListStatusFilter = LeadStatus | "ALL";

export type LeadListSortBy =
  | "name"
  | "status"
  | "team"
  | "assignee"
  | "createdAt";

export type LeadListSortOrder = "asc" | "desc";

export type ListLeadsQuery = {
  search?: string;
  status?: LeadListStatusFilter;
  teamId?: string;
  assignedToId?: string;
  sortBy?: LeadListSortBy;
  sortOrder?: LeadListSortOrder;
  page?: number;
  pageSize?: number;
};

export type LeadListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ParsedListLeadsQuery = {
  search?: string;
  status: LeadListStatusFilter;
  teamId?: string;
  assignedToId?: string;
  assignedToUnassigned?: boolean;
  sortBy: LeadListSortBy;
  sortOrder: LeadListSortOrder;
  page: number;
  pageSize: number;
};

export type PaginatedLeadsResponse = {
  leads: LeadResponse[];
  meta: LeadListMeta;
};

export type CreateLeadInput = {
  name: string;
  mobileNumber: string;
  email?: string;
  source?: string;
  project?: string;
  teamId?: string;
  assignedToId?: string | null;
};

export type UpdateLeadInput = {
  name?: string;
  mobileNumber?: string | null;
  email?: string | null;
  source?: string | null;
  project?: string | null;
  status?: LeadStatus;
};

export type AssignLeadInput = {
  assignedToId: string | null;
};

export type LeadStatusHistoryActor = {
  id: string;
  name: string;
};

export type LeadStatusHistoryCreatedEntry = {
  kind: "created";
  id: string;
  toStatus: LeadStatus;
  changedBy: LeadStatusHistoryActor;
  changedAt: string;
};

export type LeadStatusHistoryTransitionEntry = {
  kind: "transition";
  id: string;
  fromStatus: LeadStatus;
  toStatus: LeadStatus;
  changedBy: LeadStatusHistoryActor | null;
  changedAt: string;
};

export type LeadStatusHistoryEntry =
  | LeadStatusHistoryCreatedEntry
  | LeadStatusHistoryTransitionEntry;

export type LeadStatusHistoryResponse = {
  entries: LeadStatusHistoryEntry[];
};
