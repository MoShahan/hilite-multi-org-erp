import { describe, expect, it } from "vitest";

import { getNotificationDestination } from "./notificationNavigation";

import type { Notification } from "./notificationsTypes";

const mockNotification = (
  overrides?: Partial<Notification>,
): Notification => ({
  id: "notif-1",
  type: "LEAD_CREATED",
  title: "New lead",
  body: "A lead was created",
  entityType: null,
  entityId: null,
  readAt: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("getNotificationDestination", () => {
  it("returns account for welcome change password notifications", () => {
    expect(
      getNotificationDestination(
        mockNotification({ type: "WELCOME_CHANGE_PASSWORD" }),
      ),
    ).toBe("/account");
  });

  it("returns account for account entity type", () => {
    expect(
      getNotificationDestination(
        mockNotification({ entityType: "account" }),
      ),
    ).toBe("/account");
  });

  it("returns lead detail path for lead entity with id", () => {
    expect(
      getNotificationDestination(
        mockNotification({ entityType: "lead", entityId: "lead-42" }),
      ),
    ).toBe("/leads/lead-42");
  });

  it("returns null for lead entity without id", () => {
    expect(
      getNotificationDestination(
        mockNotification({ entityType: "lead", entityId: null }),
      ),
    ).toBeNull();
  });

  it("returns null for unknown notification types", () => {
    expect(
      getNotificationDestination(
        mockNotification({ type: "LEAD_CREATED", entityType: "team" }),
      ),
    ).toBeNull();
  });
});
