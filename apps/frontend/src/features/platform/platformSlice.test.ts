import { describe, expect, it, vi } from "vitest";

import {
  clearSelectedOrganization,
  fetchOrganization,
  fetchOrganizations,
  fetchPlatformAuditLogs,
  platformReducer,
  updateOrganization,
  updateOrganizationStatus,
} from "./platformSlice";
import { DEFAULT_LIST_QUERY } from "./organizationListParams";
import { DEFAULT_AUDIT_LIST_QUERY } from "@/features/audit/auditListParams";

import type { Organization } from "./platformTypes";
import type { AuditLog } from "@/features/audit/auditTypes";

vi.mock("./platformService", () => ({
  platformService: {
    listOrganizations: vi.fn(),
    getOrganization: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    updateOrganizationStatus: vi.fn(),
    listAuditLogs: vi.fn(),
  },
}));

const mockOrganization = (overrides?: Partial<Organization>): Organization => ({
  id: "org-1",
  name: "HiLite Builders",
  code: "HB",
  logoUrl: null,
  description: null,
  status: "ACTIVE",
  userCount: 5,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("platformSlice", () => {
  it("tracks organization list loading and success", () => {
    const query = DEFAULT_LIST_QUERY;
    const loading = platformReducer(
      undefined,
      fetchOrganizations.pending("", query),
    );
    expect(loading.listStatus).toBe("loading");
    expect(loading.listQuery).toEqual(query);

    const success = platformReducer(
      loading,
      fetchOrganizations.fulfilled(
        {
          organizations: [mockOrganization()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        query,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.organizations).toHaveLength(1);
  });

  it("loads and clears selected organization", () => {
    const organization = mockOrganization();
    const success = platformReducer(
      platformReducer(undefined, fetchOrganization.pending("", "org-1")),
      fetchOrganization.fulfilled(organization, "", "org-1"),
    );

    expect(success.selectedOrganization).toEqual(organization);

    const cleared = platformReducer(success, clearSelectedOrganization());
    expect(cleared.selectedOrganization).toBeNull();
    expect(cleared.detailStatus).toBe("idle");
  });

  it("updates organization in list and detail views", () => {
    const original = mockOrganization({ name: "Old Name" });
    const updated = mockOrganization({ name: "New Name" });
    const initial = {
      ...platformReducer(undefined, { type: "@@INIT" }),
      organizations: [original],
      selectedOrganization: original,
      mutationStatus: "loading" as const,
    };

    const state = platformReducer(
      initial,
      updateOrganization.fulfilled(updated, "", {
        id: "org-1",
        input: { name: "New Name" },
      }),
    );

    expect(state.selectedOrganization?.name).toBe("New Name");
    expect(state.organizations[0]?.name).toBe("New Name");
    expect(state.mutationStatus).toBe("idle");
  });

  it("updates organization status", () => {
    const suspended = mockOrganization({ status: "SUSPENDED" });
    const initial = {
      ...platformReducer(undefined, { type: "@@INIT" }),
      organizations: [mockOrganization()],
      selectedOrganization: mockOrganization(),
    };

    const state = platformReducer(
      initial,
      updateOrganizationStatus.fulfilled(suspended, "", {
        id: "org-1",
        status: "SUSPENDED",
      }),
    );

    expect(state.selectedOrganization?.status).toBe("SUSPENDED");
    expect(state.organizations[0]?.status).toBe("SUSPENDED");
  });

  it("loads platform audit logs", () => {
    const query = { ...DEFAULT_AUDIT_LIST_QUERY, organizationId: "org-1" };
    const auditLog: AuditLog = {
      id: "audit-1",
      action: "ORG_UPDATED",
      entityType: "organization",
      entityId: "org-1",
      organizationId: "org-1",
      organization: {
        id: "org-1",
        name: "HiLite Builders",
        code: "HB",
      },
      actorId: "user-1",
      actor: {
        id: "user-1",
        name: "Admin",
        email: "admin@example.com",
        roleSlug: "platform_admin",
      },
      metadata: { summary: "Organization updated" },
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    const state = platformReducer(
      platformReducer(undefined, fetchPlatformAuditLogs.pending("", query)),
      fetchPlatformAuditLogs.fulfilled(
        {
          auditLogs: [auditLog],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        query,
      ),
    );

    expect(state.auditListStatus).toBe("success");
    expect(state.auditLogs).toEqual([auditLog]);
    expect(state.auditListQuery).toEqual(query);
  });

  it("stores list errors", () => {
    const state = platformReducer(
      { ...platformReducer(undefined, { type: "@@INIT" }), listStatus: "loading" },
      fetchOrganizations.rejected(new Error("Failed"), "", DEFAULT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Failed");
  });
});
