import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { GuestRoute } from "./GuestRoute";
import { authenticatedState, mockAuthState } from "@/test/fixtures/auth";
import { renderWithProviders } from "@/test/render";

describe("GuestRoute", () => {
  it("shows a skeleton while auth is loading", () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<GuestRoute />}>
          <Route index element={<div>Login page</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: mockAuthState({ status: "loading" }),
        },
        route: "/login",
      },
    );

    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("renders guest routes for unauthenticated users", () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<GuestRoute />}>
          <Route index element={<div>Login page</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: mockAuthState({ status: "unauthenticated" }),
        },
        route: "/login",
      },
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects authenticated users away from guest routes", () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<GuestRoute />}>
          <Route index element={<div>Login page</div>} />
        </Route>
        <Route path="/" element={<div>Home page</div>} />
      </Routes>,
      {
        preloadedState: authenticatedState(),
        route: "/login",
      },
    );

    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
