import { apiClient, unwrapResponse } from "@/lib/api-client";

import { toAuditListApiParams } from "./auditListParams";

import type { AuditListQuery, ListAuditLogsResult } from "./auditTypes";

export const auditService = {
  listAuditLogs: async (query: AuditListQuery): Promise<ListAuditLogsResult> => {
    const response = await apiClient.get("/api/v1/audit", {
      params: toAuditListApiParams(query),
    });
    return unwrapResponse<ListAuditLogsResult>(response);
  },
};
