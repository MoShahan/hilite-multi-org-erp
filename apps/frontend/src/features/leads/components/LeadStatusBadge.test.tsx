import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { LeadStatusBadge } from "./LeadStatusBadge";

import { renderWithProviders } from "@/test/render";

describe("LeadStatusBadge", () => {
  it.each([
    ["NEW", "New"],
    ["CONTACTED", "Contacted"],
    ["NEGOTIATION", "Negotiation"],
    ["WON", "Won"],
    ["LOST", "Lost"],
  ] as const)("renders %s as %s", (status, label) => {
    renderWithProviders(<LeadStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
