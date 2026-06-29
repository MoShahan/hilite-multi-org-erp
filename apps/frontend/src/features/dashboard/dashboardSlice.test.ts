import { describe, expect, it, vi } from "vitest";

import {
  clearDashboard,
  dashboardReducer,
  fetchDashboard,
  resetDashboardLayout,
  updateDashboardLayout,
} from "./dashboardSlice";

vi.mock("./dashboardService", () => ({
  dashboardService: {
    getSummary: vi.fn(),
    getLayout: vi.fn(),
    updateLayout: vi.fn(),
    resetLayout: vi.fn(),
  },
}));

const mockSummary = {
  totalLeads: 10,
  openLeads: 5,
  wonLeads: 3,
  lostLeads: 2,
  winRate: 60,
};

const mockLayout = {
  widgets: [{ key: "lead_summary", width: "full" as const }],
};

describe("dashboardSlice", () => {
  it("tracks dashboard loading and success", () => {
    const loading = dashboardReducer(undefined, fetchDashboard.pending(""));
    expect(loading.status).toBe("loading");
    expect(loading.error).toBeNull();

    const success = dashboardReducer(
      loading,
      fetchDashboard.fulfilled(
        { summary: mockSummary, layout: mockLayout },
        "",
        undefined,
      ),
    );

    expect(success.status).toBe("success");
    expect(success.summary).toEqual(mockSummary);
    expect(success.layout).toEqual(mockLayout);
  });

  it("stores dashboard errors", () => {
    const state = dashboardReducer(
      { ...dashboardReducer(undefined, { type: "@@INIT" }), status: "loading" },
      fetchDashboard.rejected(new Error("Failed"), "", undefined),
    );

    expect(state.status).toBe("error");
    expect(state.error).toBe("Failed");
  });

  it("tracks layout update mutation status", () => {
    const widgets = mockLayout.widgets;
    const loading = dashboardReducer(
      undefined,
      updateDashboardLayout.pending("", widgets),
    );
    expect(loading.layoutMutationStatus).toBe("loading");

    const success = dashboardReducer(
      loading,
      updateDashboardLayout.fulfilled(mockLayout, "", widgets),
    );
    expect(success.layoutMutationStatus).toBe("idle");
    expect(success.layout).toEqual(mockLayout);
  });

  it("resets layout mutation status on update failure", () => {
    const widgets = mockLayout.widgets;
    const loading = dashboardReducer(
      undefined,
      updateDashboardLayout.pending("", widgets),
    );

    const failed = dashboardReducer(
      loading,
      updateDashboardLayout.rejected(new Error("Failed"), "", widgets),
    );
    expect(failed.layoutMutationStatus).toBe("idle");
  });

  it("tracks layout reset mutation status", () => {
    const loading = dashboardReducer(undefined, resetDashboardLayout.pending(""));
    expect(loading.layoutMutationStatus).toBe("loading");

    const success = dashboardReducer(
      loading,
      resetDashboardLayout.fulfilled(mockLayout, "", undefined),
    );
    expect(success.layoutMutationStatus).toBe("idle");
    expect(success.layout).toEqual(mockLayout);
  });

  it("clears dashboard state", () => {
    const populated = dashboardReducer(
      undefined,
      fetchDashboard.fulfilled(
        { summary: mockSummary, layout: mockLayout },
        "",
        undefined,
      ),
    );

    expect(dashboardReducer(populated, clearDashboard())).toEqual({
      summary: null,
      layout: null,
      status: "idle",
      error: null,
      layoutMutationStatus: "idle",
    });
  });
});
