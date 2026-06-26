import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { RequirePermission } from "./RequirePermission";
import { authenticatedState } from "@/test/fixtures/auth";
import { renderWithProviders } from "@/test/render";

describe("RequirePermission", () => {
  it("renders children when all required permissions are present", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequirePermission permissions={["users:read", "teams:read"]}>
              <div>Protected content</div>
            </RequirePermission>
          }
        />
      </Routes>,
      { preloadedState: authenticatedState() },
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects when a required permission is missing in all mode", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequirePermission permissions={["users:read", "roles:read"]}>
              <div>Protected content</div>
            </RequirePermission>
          }
        />
        <Route path="/fallback" element={<div>Fallback page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState(),
        route: "/fallback",
      },
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when any permission matches in any mode", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequirePermission
              permissions={["roles:read", "users:read"]}
              mode="any"
            >
              <div>Any permission content</div>
            </RequirePermission>
          }
        />
      </Routes>,
      { preloadedState: authenticatedState() },
    );

    expect(screen.getByText("Any permission content")).toBeInTheDocument();
  });

  it("redirects when no permissions match in any mode", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequirePermission
              permissions={["roles:read", "leads:read"]}
              mode="any"
            >
              <div>Any permission content</div>
            </RequirePermission>
          }
        />
      </Routes>,
      { preloadedState: authenticatedState() },
    );

    expect(screen.queryByText("Any permission content")).not.toBeInTheDocument();
  });
});
