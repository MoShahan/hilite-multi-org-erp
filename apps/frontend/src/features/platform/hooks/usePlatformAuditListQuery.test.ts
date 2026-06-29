import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePlatformAuditListQuery } from "./usePlatformAuditListQuery";
import { platformAdminState } from "@/test/fixtures/auth";
import { renderHookWithProviders } from "@/test/render";

vi.mock("../platformService", () => ({
  platformService: {
    listAuditLogs: vi.fn().mockResolvedValue({
      auditLogs: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }),
  },
}));

describe("usePlatformAuditListQuery", () => {
  it("parses query from URL search params", () => {
    const { result } = renderHookWithProviders(() => usePlatformAuditListQuery(), {
      route: "/?search=login&page=2",
      preloadedState: platformAdminState(),
    });

    expect(result.current.query.search).toBe("login");
    expect(result.current.query.page).toBe(2);
  });

  it("resets page when filters change via patchQuery", () => {
    const { result } = renderHookWithProviders(() => usePlatformAuditListQuery(), {
      route: "/?page=3",
      preloadedState: platformAdminState(),
    });

    act(() => {
      result.current.patchQuery({ organizationId: "org-1" });
    });

    expect(result.current.query.page).toBe(1);
    expect(result.current.query.organizationId).toBe("org-1");
  });

  it("dispatches fetch on mount", async () => {
    const { store } = renderHookWithProviders(() => usePlatformAuditListQuery(), {
      preloadedState: platformAdminState(),
    });

    await vi.waitFor(() => {
      expect(store.getState().platform.auditListStatus).toBe("success");
    });
  });
});
