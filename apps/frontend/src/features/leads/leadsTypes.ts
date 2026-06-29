import {
  ACTIVITY_TYPE_LABELS,
  type ActivityType,
  type LeadStatus,
} from "@hilite/shared";

export type { ActivityType, LeadStatus };

export type LeadUserSummary = {
  id: string;
  name: string;
  email: string;
};

export type LeadTeamSummary = {
  id: string;
  name: string;
};

export type Lead = {
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

export type Activity = {
  id: string;
  type: ActivityType;
  notes: string;
  createdBy: LeadUserSummary;
  createdAt: string;
};

export type LeadListStatusFilter = LeadStatus | "ALL";

export type LeadListSortBy =
  | "name"
  | "status"
  | "team"
  | "assignee"
  | "createdAt";

export type LeadListSortOrder = "asc" | "desc";

export type LeadListQuery = {
  search: string;
  status: LeadListStatusFilter;
  teamId: string;
  assignedToId: string;
  sortBy: LeadListSortBy;
  sortOrder: LeadListSortOrder;
  page: number;
  pageSize: number;
};

export type LeadListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListLeadsResult = {
  leads: Lead[];
  meta: LeadListMeta;
};

export type ActivityListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListActivitiesResult = {
  activities: Activity[];
  meta: ActivityListMeta;
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

export type CreateActivityInput = {
  type: ActivityType;
  notes: string;
};

export type TeamFilterOption = {
  id: string;
  name: string;
};

export type AssigneeOption = {
  id: string;
  name: string;
  email: string;
};

export type LeadsState = {
  leads: Lead[];
  listMeta: LeadListMeta | null;
  listQuery: LeadListQuery | null;
  listStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
  selectedLead: Lead | null;
  detailStatus: "idle" | "loading" | "success" | "error";
  detailError: string | null;
  activities: Activity[];
  activitiesMeta: ActivityListMeta | null;
  activitiesStatus: "idle" | "loading" | "success" | "error";
  statusHistory: LeadStatusHistoryEntry[];
  statusHistoryStatus: "idle" | "loading" | "success" | "error";
  mutationStatus: "idle" | "loading";
};

export { LEAD_STATUS_FILTER_OPTIONS } from "./leadStatusPipeline";

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] =
  (Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(
    ([value, label]) => ({ value, label }),
  );
