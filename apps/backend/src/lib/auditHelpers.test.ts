import { describe, expect, it } from "vitest";

import { AuditAction } from "../generated/prisma/client";
import {
  buildActorSnapshot,
  buildChangeSet,
  buildSummary,
  mergeRequestContext,
} from "./auditHelpers";

describe("buildActorSnapshot", () => {
  it("returns undefined when auth user is missing", () => {
    expect(buildActorSnapshot(null)).toBeUndefined();
  });

  it("maps auth user fields", () => {
    expect(
      buildActorSnapshot({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        role: { slug: "team_lead" },
      }),
    ).toEqual({
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      roleSlug: "team_lead",
    });
  });
});

describe("buildChangeSet", () => {
  it("captures only changed fields", () => {
    const result = buildChangeSet(
      { name: "Old", status: "ACTIVE", team: "A" },
      { name: "New", status: "ACTIVE", team: "B" },
      ["name", "status", "team"],
    );

    expect(result.changedFields).toEqual(["name", "team"]);
    expect(result.before).toEqual({ name: "Old", team: "A" });
    expect(result.after).toEqual({ name: "New", team: "B" });
  });
});

describe("buildSummary", () => {
  it("uses metadata summary when provided", () => {
    expect(
      buildSummary(AuditAction.LEAD_CREATED, {
        summary: "Custom summary",
      }),
    ).toBe("Custom summary");
  });

  it("includes related lead name in summary", () => {
    expect(
      buildSummary(AuditAction.LEAD_UPDATED, {
        related: { lead: { name: "Acme Corp" } },
      }),
    ).toBe("Lead updated: Acme Corp");
  });
});

describe("mergeRequestContext", () => {
  it("returns metadata unchanged when request context is empty", () => {
    const metadata = { summary: "Updated user" };

    expect(mergeRequestContext(metadata, {})).toBe(metadata);
  });

  it("merges request ip and user agent", () => {
    expect(
      mergeRequestContext(
        { summary: "Updated user", request: { ip: "1.2.3.4" } },
        { userAgent: "vitest" },
      ),
    ).toEqual({
      summary: "Updated user",
      request: { ip: "1.2.3.4", userAgent: "vitest" },
    });
  });
});
