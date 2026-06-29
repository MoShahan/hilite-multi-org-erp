import { describe, expect, it } from "vitest";

import { UserStatus } from "../generated/prisma/client";
import { resolveLoginOrgId } from "./orgMembership";
import { expectAppError } from "../test/helpers";

describe("resolveLoginOrgId", () => {
  it("returns null when there are no active memberships", () => {
    const result = resolveLoginOrgId([
      { organizationId: "org-1", status: UserStatus.INACTIVE },
    ]);

    expect(result).toBeNull();
  });

  it("returns the org id when exactly one active membership exists", () => {
    const result = resolveLoginOrgId([
      { organizationId: "org-1", status: UserStatus.INACTIVE },
      { organizationId: "org-2", status: UserStatus.ACTIVE },
    ]);

    expect(result).toBe("org-2");
  });

  it("throws when multiple active memberships exist", () => {
    expectAppError(
      () =>
        resolveLoginOrgId([
          { organizationId: "org-1", status: UserStatus.ACTIVE },
          { organizationId: "org-2", status: UserStatus.ACTIVE },
        ]),
      403,
      "ORG_SELECTION_REQUIRED",
    );
  });
});
