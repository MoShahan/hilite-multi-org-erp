import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { DefaultLandingRedirect } from "./DefaultLandingRedirect";
import { authenticatedState, mockUser } from "@/test/fixtures/auth";
import { renderWithProviders } from "@/test/render";

describe("DefaultLandingRedirect", () => {
  it("redirects to dashboard when dashboards module and permission are available", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DefaultLandingRedirect />} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState({
          modules: ["dashboards"],
          user: mockUser({ permissions: ["dashboard:me"] }),
        }),
      },
    );

    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
  });

  it("redirects to leads when sales ERP module and lead read permission are available", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DefaultLandingRedirect />} />
        <Route path="/leads" element={<div>Leads page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState({
          modules: ["sales_erp"],
          user: mockUser({ permissions: ["leads:read"] }),
        }),
      },
    );

    expect(screen.getByText("Leads page")).toBeInTheDocument();
  });

  it("redirects to users when only users:read is available", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DefaultLandingRedirect />} />
        <Route path="/users" element={<div>Users page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState({
          modules: [],
          user: mockUser({ permissions: ["users:read"] }),
        }),
      },
    );

    expect(screen.getByText("Users page")).toBeInTheDocument();
  });

  it("redirects to leads when dashboards module is enabled but dashboard permission is missing", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DefaultLandingRedirect />} />
        <Route path="/leads" element={<div>Leads page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState({
          modules: ["dashboards", "sales_erp"],
          user: mockUser({ permissions: ["leads:read"] }),
        }),
      },
    );

    expect(screen.getByText("Leads page")).toBeInTheDocument();
  });

  it("falls back to home when no landing permission matches", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DefaultLandingRedirect />} />
        <Route path="/home" element={<div>Home page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState({
          modules: [],
          user: mockUser({ permissions: [] }),
        }),
      },
    );

    expect(screen.getByText("Home page")).toBeInTheDocument();
  });
});
