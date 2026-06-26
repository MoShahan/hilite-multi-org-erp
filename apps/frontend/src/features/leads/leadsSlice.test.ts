import { describe, expect, it, vi } from "vitest";

import {
  assignLead,
  clearSelectedLead,
  createLead,
  fetchActivities,
  fetchLead,
  fetchLeads,
  leadsReducer,
  updateLead,
} from "./leadsSlice";
import { DEFAULT_LIST_QUERY } from "./leadListParams";

import type { Activity, Lead } from "./leadsTypes";

vi.mock("./leadsService", () => ({
  leadsService: {
    listLeads: vi.fn(),
    getLead: vi.fn(),
    createLead: vi.fn(),
    updateLead: vi.fn(),
    assignLead: vi.fn(),
    listActivities: vi.fn(),
    createActivity: vi.fn(),
  },
}));

const mockLead = (overrides?: Partial<Lead>): Lead => ({
  id: "lead-1",
  name: "Acme Corp",
  mobileNumber: null,
  email: "contact@acme.com",
  source: null,
  project: null,
  status: "NEW",
  team: { id: "team-1", name: "Sales" },
  assignedTo: null,
  createdBy: {
    id: "user-1",
    name: "Creator",
    email: "creator@example.com",
  },
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("leadsSlice", () => {
  it("tracks list loading and success", () => {
    const query = DEFAULT_LIST_QUERY;
    const loading = leadsReducer(undefined, fetchLeads.pending("", query));
    expect(loading.listStatus).toBe("loading");
    expect(loading.listQuery).toEqual(query);

    const success = leadsReducer(
      loading,
      fetchLeads.fulfilled(
        {
          leads: [mockLead()],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        query,
      ),
    );

    expect(success.listStatus).toBe("success");
    expect(success.leads).toHaveLength(1);
  });

  it("stores list errors", () => {
    const state = leadsReducer(
      { ...leadsReducer(undefined, { type: "@@INIT" }), listStatus: "loading" },
      fetchLeads.rejected(new Error("Network error"), "", DEFAULT_LIST_QUERY),
    );

    expect(state.listStatus).toBe("error");
    expect(state.listError).toBe("Network error");
  });

  it("loads and clears selected lead detail", () => {
    const lead = mockLead();
    const loading = leadsReducer(undefined, fetchLead.pending("", "lead-1"));
    expect(loading.detailStatus).toBe("loading");

    const success = leadsReducer(
      loading,
      fetchLead.fulfilled(lead, "", "lead-1"),
    );
    expect(success.selectedLead).toEqual(lead);

    const cleared = leadsReducer(success, clearSelectedLead());
    expect(cleared.selectedLead).toBeNull();
    expect(cleared.detailStatus).toBe("idle");
    expect(cleared.activities).toEqual([]);
  });

  it("updates list and selected lead after updateLead.fulfilled", () => {
    const original = mockLead({ status: "NEW" });
    const updated = mockLead({ status: "CONTACTED" });
    const initial = {
      ...leadsReducer(undefined, { type: "@@INIT" }),
      leads: [original],
      selectedLead: original,
    };

    const state = leadsReducer(
      initial,
      updateLead.fulfilled(updated, "", {
        leadId: "lead-1",
        input: { status: "CONTACTED" },
      }),
    );

    expect(state.selectedLead?.status).toBe("CONTACTED");
    expect(state.leads[0]?.status).toBe("CONTACTED");
    expect(state.mutationStatus).toBe("idle");
  });

  it("updates selected lead after assignLead.fulfilled", () => {
    const assigned = mockLead({
      assignedTo: {
        id: "user-2",
        name: "Assignee",
        email: "assignee@example.com",
      },
    });
    const initial = {
      ...leadsReducer(undefined, { type: "@@INIT" }),
      selectedLead: mockLead(),
      mutationStatus: "loading" as const,
    };

    const state = leadsReducer(
      initial,
      assignLead.fulfilled(assigned, "", {
        leadId: "lead-1",
        input: { assignedToId: "user-2" },
      }),
    );

    expect(state.selectedLead?.assignedTo?.id).toBe("user-2");
    expect(state.mutationStatus).toBe("idle");
  });

  it("loads activities for a lead", () => {
    const activity: Activity = {
      id: "activity-1",
      type: "NOTE",
      notes: "Called client",
      createdBy: {
        id: "user-1",
        name: "Creator",
        email: "creator@example.com",
      },
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    const state = leadsReducer(
      leadsReducer(undefined, fetchActivities.pending("", "lead-1")),
      fetchActivities.fulfilled(
        {
          activities: [activity],
          meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
        },
        "",
        "lead-1",
      ),
    );

    expect(state.activitiesStatus).toBe("success");
    expect(state.activities).toEqual([activity]);
  });

  it("tracks mutation loading for createLead", () => {
    const pending = leadsReducer(undefined, createLead.pending("", {
      name: "New Lead",
      mobileNumber: "9876543210",
      email: "new@example.com",
    }));
    expect(pending.mutationStatus).toBe("loading");

    const fulfilled = leadsReducer(
      pending,
      createLead.fulfilled(mockLead(), "", {
        name: "New Lead",
        mobileNumber: "9876543210",
        email: "new@example.com",
      }),
    );
    expect(fulfilled.mutationStatus).toBe("idle");
  });
});
