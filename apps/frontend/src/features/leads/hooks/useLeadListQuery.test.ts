import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useLeadListQuery } from "./useLeadListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../leadsService", () => ({
  leadsService: {
    listLeads: vi.fn().mockResolvedValue({
      leads: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useLeadListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useLeadListQuery(), {
      route: "/?search=acme&page=2",
      preloadedState: authenticatedState({ modules: ["sales_erp"] }),
    });

    expect(result.current.query.search).toBe("acme");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useLeadListQuery(), {
      route: "/?page=3",
      preloadedState: authenticatedState({ modules: ["sales_erp"] }),
    });

    act(() => {
      result.current.patchQuery({ search: "acme" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.search).toBe("acme");
  });

  it("does not reset page when only page changes", () => {
    const { result } = renderHookWithProviders(() => useLeadListQuery(), {
      route: "/?page=2",
      preloadedState: authenticatedState({ modules: ["sales_erp"] }),
    });

    act(() => {
      result.current.patchQuery({ page: 4 });
    });

    expect(result.current.query.page).toBe(4);
  });

  it("clears filters while preserving sort defaults", () => {
    const { result } = renderHookWithProviders(() => useLeadListQuery(), {
      route: "/?search=acme&status=NEW",
      preloadedState: authenticatedState({ modules: ["sales_erp"] }),
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.query.search).toBe("");
    expect(result.current.query.status).toBe("ALL");
  });

  it("skips fetch when sales ERP module is disabled", () => {
    const { store } = renderHookWithProviders(() => useLeadListQuery(), {
      preloadedState: authenticatedState({ modules: [] }),
    });

    expect(store.getState().leads.listStatus).toBe("idle");
  });

  it("dispatches fetch when sales ERP module is enabled", async () => {
    const { store } = renderHookWithProviders(() => useLeadListQuery(), {
      preloadedState: authenticatedState({ modules: ["sales_erp"] }),
    });

    await vi.waitFor(() => {
      expect(store.getState().leads.listStatus).toBe("success");
    });
  });
});
