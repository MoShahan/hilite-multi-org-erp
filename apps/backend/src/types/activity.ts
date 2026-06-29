import type { LeadUserSummary } from "./lead";
import type { ActivityType } from "../generated/prisma/client";


export type ActivityResponse = {
  id: string;
  type: ActivityType;
  notes: string;
  createdBy: LeadUserSummary;
  createdAt: string;
};

export type ActivityListSortOrder = "asc" | "desc";

export type ListActivitiesQuery = {
  page?: number;
  pageSize?: number;
};

export type ActivityListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ParsedListActivitiesQuery = {
  page: number;
  pageSize: number;
};

export type PaginatedActivitiesResponse = {
  activities: ActivityResponse[];
  meta: ActivityListMeta;
};

export type CreateActivityInput = {
  type: ActivityType;
  notes: string;
};
