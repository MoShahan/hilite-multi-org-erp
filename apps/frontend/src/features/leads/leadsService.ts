import { usersService } from "@/features/users/usersService";
import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toLeadListApiParams } from "./leadListParams";

import type {
  Activity,
  AssignLeadInput,
  CreateActivityInput,
  CreateLeadInput,
  Lead,
  LeadListQuery,
  ListActivitiesResult,
  ListLeadsResult,
  LeadStatusHistoryResponse,
  UpdateLeadInput,
} from "./leadsTypes";
import type { UserOption } from "@/features/users/usersTypes";

export const leadsService = {
  listLeads: async (query: LeadListQuery): Promise<ListLeadsResult> => {
    const response = await apiClient.get("/api/v1/leads", {
      params: toLeadListApiParams(query),
    });
    return unwrapResponse<ListLeadsResult>(response);
  },

  getLead: async (leadId: string): Promise<Lead> => {
    const response = await apiClient.get(`/api/v1/leads/${leadId}`);
    return unwrapResponse<Lead>(response);
  },

  createLead: async (input: CreateLeadInput): Promise<Lead> => {
    const response = await apiClient.post("/api/v1/leads", input);
    return unwrapResponse<Lead>(response);
  },

  updateLead: async (
    leadId: string,
    input: UpdateLeadInput,
  ): Promise<Lead> => {
    const response = await apiClient.patch(`/api/v1/leads/${leadId}`, input);
    return unwrapResponse<Lead>(response);
  },

  assignLead: async (
    leadId: string,
    input: AssignLeadInput,
  ): Promise<Lead> => {
    const response = await apiClient.patch(
      `/api/v1/leads/${leadId}/assign`,
      input,
    );
    return unwrapResponse<Lead>(response);
  },

  listActivities: async (
    leadId: string,
    page = 1,
    pageSize = 20,
  ): Promise<ListActivitiesResult> => {
    const response = await apiClient.get(`/api/v1/leads/${leadId}/activities`, {
      params: { page, pageSize },
    });
    return unwrapResponse<ListActivitiesResult>(response);
  },

  listStatusHistory: async (
    leadId: string,
  ): Promise<LeadStatusHistoryResponse> => {
    const response = await apiClient.get(
      `/api/v1/leads/${leadId}/status-history`,
    );
    return unwrapResponse<LeadStatusHistoryResponse>(response);
  },

  createActivity: async (
    leadId: string,
    input: CreateActivityInput,
  ): Promise<Activity> => {
    const response = await apiClient.post(
      `/api/v1/leads/${leadId}/activities`,
      input,
    );
    return unwrapResponse<Activity>(response);
  },

  listAssignableUsers: async (teamId: string): Promise<UserOption[]> => {
    const result = await usersService.listUserOptions({
      for: "lead-assignment",
      teamId,
    });
    return result.users;
  },
};
