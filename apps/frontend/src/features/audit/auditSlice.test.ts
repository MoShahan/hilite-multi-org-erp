import { describe, expect, it, vi } from "vitest";

import { auditReducer, fetchAuditLogs } from "./auditSlice";
import { DEFAULT_AUDIT_LIST_QUERY } from "./auditListParams";

vi.mock("./auditService", () => ({
  auditService: {
    listAuditLogs: vi.fn(),
  },
}));

const mockAuditLog = {
  id: "audit-1",
  action: "USER_CREATED" as const,
  entityType: "user" as const,
  entityId: "user-1",
  actorId: "actor-1",
  organizationId: "org-1",
  metadata: { summary: "User created" },
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("auditSlice", () => {
  it("tracks list loading and success", () => {
    const query = DEFAULT_AUDIT_LIST_QUERY;
    const loading = auditReducer(undefined, fetchAuditLogs.pending("", query));
    expect(loading.listStatus).toBe("loading");
    expect(loading.listQuery).toEqual(query);

    const success = auditReducer(
      loading,
      fetchAuditLogs.fulfilled(
        {
          auditLogs: [mockAuditLog],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        query,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.auditLogs).toHaveLength(1);
    expect(success.listMeta?.total).toBe(1);
  });

  it("stores list errors", () => {
    const state = auditReducer(
      { ...auditReducer(undefined, { type: "@@INIT" }), listStatus: "loading" },
      fetchAuditLogs.rejected(new Error("Failed"), "", DEFAULT_AUDIT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Failed");
  });
});
