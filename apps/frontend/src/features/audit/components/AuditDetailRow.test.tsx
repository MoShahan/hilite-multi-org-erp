import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { AuditDetailRow } from "./AuditDetailRow";
import { renderWithProviders } from "@/test/render";

import type { AuditLog } from "../auditTypes";

const mockAuditLog = (metadata: AuditLog["metadata"]): AuditLog => ({
  id: "audit-1",
  organizationId: "org-1",
  organization: { id: "org-1", name: "Test Org", code: "TEST" },
  actorId: "user-1",
  actor: {
    id: "user-1",
    name: "Actor",
    email: "actor@example.com",
    roleSlug: "org_admin",
  },
  action: "USER_CREATED",
  entityType: "user",
  entityId: "user-2",
  metadata,
  createdAt: "2026-06-01T00:00:00.000Z",
});

describe("AuditDetailRow", () => {
  it("renders em dash for null diff values", () => {
    renderWithProviders(
      <AuditDetailRow
        log={mockAuditLog({
          summary: "User created",
          before: { status: null },
        })}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders JSON for object diff values", () => {
    renderWithProviders(
      <AuditDetailRow
        log={mockAuditLog({
          summary: "User updated",
          after: { profile: { name: "Jane" } },
        })}
      />,
    );

    expect(screen.getByText(/"name": "Jane"/)).toBeInTheDocument();
  });

  it("renders primitive diff values as strings", () => {
    renderWithProviders(
      <AuditDetailRow
        log={mockAuditLog({
          summary: "User updated",
          after: { status: "ACTIVE" },
        })}
      />,
    );

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });
});
