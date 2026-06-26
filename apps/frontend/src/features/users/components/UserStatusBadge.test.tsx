import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { UserStatusBadge } from "./UserStatusBadge";

import { renderWithProviders } from "@/test/render";

describe("UserStatusBadge", () => {
  it("renders Active for ACTIVE status", () => {
    renderWithProviders(<UserStatusBadge status="ACTIVE" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders Inactive for INACTIVE status", () => {
    renderWithProviders(<UserStatusBadge status="INACTIVE" />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
