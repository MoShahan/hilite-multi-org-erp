import { describe, expect, it } from "vitest";

import { LeadStatus } from "../generated/prisma/client";

import { sortLeadRowsByStatus } from "./leadStatusSort";

const row = (id: string, status: LeadStatus) => ({ id, status });

describe("sortLeadRowsByStatus", () => {
  const rows = [
    row("lost-1", LeadStatus.LOST),
    row("new-1", LeadStatus.NEW),
    row("won-1", LeadStatus.WON),
    row("contacted-1", LeadStatus.CONTACTED),
    row("negotiation-1", LeadStatus.NEGOTIATION),
    row("visit-scheduled-1", LeadStatus.VISIT_SCHEDULED),
    row("site-visit-1", LeadStatus.SITE_VISIT_COMPLETED),
  ];

  it("sorts ascending by pipeline order", () => {
    expect(sortLeadRowsByStatus(rows, "asc", 0, rows.length)).toEqual([
      "new-1",
      "contacted-1",
      "visit-scheduled-1",
      "site-visit-1",
      "negotiation-1",
      "won-1",
      "lost-1",
    ]);
  });

  it("sorts descending by pipeline order", () => {
    expect(sortLeadRowsByStatus(rows, "desc", 0, rows.length)).toEqual([
      "lost-1",
      "won-1",
      "negotiation-1",
      "site-visit-1",
      "visit-scheduled-1",
      "contacted-1",
      "new-1",
    ]);
  });

  it("applies skip and take after sorting", () => {
    expect(sortLeadRowsByStatus(rows, "asc", 2, 3)).toEqual([
      "visit-scheduled-1",
      "site-visit-1",
      "negotiation-1",
    ]);
  });

  it("preserves relative order for rows with the same status", () => {
    const duplicateStatusRows = [
      row("new-a", LeadStatus.NEW),
      row("new-b", LeadStatus.NEW),
      row("lost-a", LeadStatus.LOST),
    ];

    expect(
      sortLeadRowsByStatus(duplicateStatusRows, "asc", 0, duplicateStatusRows.length),
    ).toEqual(["new-a", "new-b", "lost-a"]);
  });
});
