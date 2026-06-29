import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationStatus, UserStatus } from "../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { toAuthContext, toAuthMeResponse } from "./authUserMapper";
import type { UserWithAuthRelations } from "./authUserMapper";
import { expectAppErrorAsync } from "../test/helpers";

vi.mock("../services/organizationModule.service", () => ({
  organizationModuleService: {
    getEnabledModuleKeys: vi.fn(),
  },
}));

import { organizationModuleService } from "../services/organizationModule.service";

const baseUserRecord = (
  overrides?: Partial<UserWithAuthRelations>,
): UserWithAuthRelations => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  phoneNumber: null,
  status: UserStatus.ACTIVE,
  memberships: [
    {
      status: UserStatus.ACTIVE,
      organization: {
        id: "org-1",
        name: "Test Org",
        code: "TEST",
        status: OrganizationStatus.ACTIVE,
      },
      role: {
        id: "role-1",
        name: "Team Lead",
        slug: "team_lead",
        permissions: [{ permissionKey: PERMISSIONS.LEADS_READ }],
      },
      teamMember: {
        team: { id: "team-a", name: "Team A" },
      },
    },
  ],
  userRole: null,
  ...overrides,
});

describe("toAuthContext", () => {
  beforeEach(() => {
    vi.mocked(organizationModuleService.getEnabledModuleKeys).mockReset();
    vi.mocked(organizationModuleService.getEnabledModuleKeys).mockResolvedValue([
      "sales_erp",
    ]);
  });

  it("builds org auth context for active membership", async () => {
    const context = await toAuthContext(baseUserRecord(), "org-1");

    expect(context.organization?.id).toBe("org-1");
    expect(context.membership?.permissions).toEqual([PERMISSIONS.LEADS_READ]);
    expect(context.membership?.team).toEqual({ id: "team-a", name: "Team A" });
    expect(context.modules).toEqual(["sales_erp"]);
  });

  it("rejects inactive memberships", async () => {
    await expectAppErrorAsync(
      () =>
        toAuthContext(
          baseUserRecord({
            memberships: [
              {
                ...baseUserRecord().memberships[0]!,
                status: UserStatus.INACTIVE,
              },
            ],
          }),
          "org-1",
        ),
      403,
      "ACCOUNT_INACTIVE",
    );
  });

  it("builds platform auth context when organization id is null", async () => {
    vi.mocked(organizationModuleService.getEnabledModuleKeys).mockResolvedValue([]);

    const context = await toAuthContext(
      baseUserRecord({
        memberships: [],
        userRole: {
          role: {
            id: "platform-role",
            name: "Platform Admin",
            slug: "platform_admin",
            permissions: [{ permissionKey: PERMISSIONS.PLATFORM_ORGS_READ }],
          },
        },
      }),
      null,
    );

    expect(context.organization).toBeNull();
    expect(context.membership?.role.slug).toBe("platform_admin");
  });

  it("rejects platform users without a role", async () => {
    await expectAppErrorAsync(
      () => toAuthContext(baseUserRecord({ memberships: [], userRole: null }), null),
      403,
      "ROLE_NOT_ASSIGNED",
    );
  });
});

describe("toAuthMeResponse", () => {
  it("flattens auth context into API response", async () => {
    const context = await toAuthContext(baseUserRecord(), "org-1");
    const response = toAuthMeResponse(context);

    expect(response.user.id).toBe("user-1");
    expect(response.user.permissions).toEqual([PERMISSIONS.LEADS_READ]);
    expect(response.organization?.code).toBe("TEST");
    expect(response.modules).toEqual(["sales_erp"]);
  });
});
