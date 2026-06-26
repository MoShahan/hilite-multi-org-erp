import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DASHBOARD_WIDGET_KEYS,
  getDefaultLayoutForView,
} from "../constants/dashboardWidgets";
import { dashboardLayoutRepository } from "../repositories/dashboardLayout.repository";
import { dashboardLayoutService } from "./dashboardLayout.service";
import type { AuthUser } from "../types/auth";

vi.mock("../repositories/dashboardLayout.repository", () => ({
  dashboardLayoutRepository: {
    findByUserId: vi.fn(),
    upsert: vi.fn(),
  },
}));

const meUser: AuthUser = {
  id: "user-me",
  email: "me@test.com",
  name: "Me User",
  status: "ACTIVE",
  organizationId: "org-1",
  role: { id: "role-1", name: "Executive", slug: "executive" },
  permissions: ["dashboard:me"],
  team: { id: "team-1", name: "North" },
};

const orgUser: AuthUser = {
  ...meUser,
  id: "user-org",
  permissions: ["dashboard:org"],
};

describe("dashboardLayoutService.getLayout", () => {
  beforeEach(() => {
    vi.mocked(dashboardLayoutRepository.findByUserId).mockReset();
  });

  it("returns default layout when no saved layout exists", async () => {
    vi.mocked(dashboardLayoutRepository.findByUserId).mockResolvedValue(null);

    const result = await dashboardLayoutService.getLayout(meUser);

    expect(result.view).toBe("me");
    expect(result.widgets).toEqual(getDefaultLayoutForView("me"));
    expect(result.catalog).toHaveLength(4);
  });

  it("returns default layout when saved view does not match current view", async () => {
    vi.mocked(dashboardLayoutRepository.findByUserId).mockResolvedValue({
      userId: orgUser.id,
      view: "me",
      widgets: [
        {
          key: DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
          order: 0,
          visible: false,
        },
      ],
      updatedAt: new Date(),
    });

    const result = await dashboardLayoutService.getLayout(orgUser);

    expect(result.view).toBe("org");
    expect(result.widgets).toEqual(getDefaultLayoutForView("org"));
  });

  it("merges saved layout with catalog for matching view", async () => {
    vi.mocked(dashboardLayoutRepository.findByUserId).mockResolvedValue({
      userId: meUser.id,
      view: "me",
      widgets: [
        {
          key: DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
          order: 0,
          visible: true,
        },
        {
          key: DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
          order: 1,
          visible: false,
        },
      ],
      updatedAt: new Date(),
    });

    const result = await dashboardLayoutService.getLayout(meUser);

    expect(result.widgets[0]?.key).toBe(
      DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
    );
    expect(
      result.widgets.find(
        (item) => item.key === DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
      )?.visible,
    ).toBe(false);
    expect(result.widgets).toHaveLength(4);
  });
});

describe("dashboardLayoutService.updateLayout", () => {
  beforeEach(() => {
    vi.mocked(dashboardLayoutRepository.upsert).mockReset();
    vi.mocked(dashboardLayoutRepository.upsert).mockResolvedValue({
      userId: meUser.id,
      view: "me",
      widgets: [],
      updatedAt: new Date(),
    });
  });

  it("rejects layouts with no visible widgets", async () => {
    const widgets = getDefaultLayoutForView("me").map((item) => ({
      ...item,
      visible: false,
    }));

    await expect(
      dashboardLayoutService.updateLayout(meUser, widgets),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects unknown widget keys for the view", async () => {
    const widgets = getDefaultLayoutForView("me").map((item, order) => ({
      ...item,
      order,
      key:
        order === 0
          ? (DASHBOARD_WIDGET_KEYS.TOP_TEAMS as typeof item.key)
          : item.key,
    }));

    await expect(
      dashboardLayoutService.updateLayout(meUser, widgets),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("normalizes order and persists layout", async () => {
    const widgets = [...getDefaultLayoutForView("me")].reverse().map(
      (item, order) => ({
        ...item,
        order,
      }),
    );

    const result = await dashboardLayoutService.updateLayout(meUser, widgets);

    expect(dashboardLayoutRepository.upsert).toHaveBeenCalledWith(
      meUser.id,
      "me",
      expect.arrayContaining([
        expect.objectContaining({ order: 0 }),
        expect.objectContaining({ order: 3 }),
      ]),
    );
    expect(result.widgets[0]?.key).toBe(
      widgets.find((item) => item.order === 0)?.key,
    );
  });
});
