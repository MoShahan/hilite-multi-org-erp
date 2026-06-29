import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAuditListQuery } from "./useAuditListQuery";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../auditService", () => ({
  auditService: {
    listAuditLogs: vi.fn().mockResolvedValue({
      auditLogs: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("useAuditListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => useAuditListQuery(), {
      route: "/?search=login&page=2",
      preloadedState: authenticatedState(),
    });

    expect(result.current.query.search).toBe("login");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => useAuditListQuery(), {
      route: "/?page=3",
      preloadedState: authenticatedState(),
    });

    act(() => {
      result.current.patchQuery({ action: "AUTH_LOGIN_SUCCESS" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.action).toBe("AUTH_LOGIN_SUCCESS");
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => useAuditListQuery(), {
      preloadedState: authenticatedState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().audit.listStatus).toBe("success");
    });
  });
});
