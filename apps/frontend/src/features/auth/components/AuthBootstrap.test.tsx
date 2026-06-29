import { describe, expect, it, vi } from "vitest";

import { AuthBootstrap } from "./AuthBootstrap";
import { mockAuthState } from "@/test/fixtures/auth";
import { renderWithProviders } from "@/test/render";

vi.mock("../authService", () => ({
  authService: {
    fetchMe: vi.fn().mockResolvedValue({
      user: null,
      organization: null,
      modules: [],
    }),
  },
}));

describe("AuthBootstrap", () => {
  it("dispatches fetchMe once when auth status is idle", async () => {
    const { store } = renderWithProviders(<AuthBootstrap />, {
      preloadedState: {
        auth: mockAuthState({ status: "idle" }),
      },
    });

    await vi.waitFor(() => {
      expect(store.getState().auth.status).not.toBe("idle");
    });
  });

  it("does not dispatch fetchMe when auth status is not idle", () => {
    const { store } = renderWithProviders(<AuthBootstrap />, {
      preloadedState: {
        auth: mockAuthState({ status: "authenticated" }),
      },
    });

    expect(store.getState().auth.status).toBe("authenticated");
  });
});
