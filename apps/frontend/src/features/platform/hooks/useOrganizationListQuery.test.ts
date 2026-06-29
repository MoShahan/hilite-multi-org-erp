import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOrganizationListQuery } from "./useOrganizationListQuery";
import { platformAdminState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../platformService", () => ({
  platformService: {
    listOrganizations: vi.fn().mockResolvedValue({
      organizations: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useOrganizationListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useOrganizationListQuery(), {
      route: "/?search=acme&page=2",
      preloadedState: platformAdminState(),
    });

    expect(result.current.query.search).toBe("acme");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useOrganizationListQuery(), {
      route: "/?page=3",
      preloadedState: platformAdminState(),
    });

    act(() => {
      result.current.patchQuery({ status: "ACTIVE" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.status).toBe("ACTIVE");
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => useOrganizationListQuery(), {
      preloadedState: platformAdminState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().platform.listStatus).toBe("success");
    });
  });
});
