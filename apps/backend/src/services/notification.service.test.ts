import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/notification.repository", () => ({
  notificationRepository: {
    createMany: vi.fn(),
    findPaginated: vi.fn(),
    countUnread: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}));

import { NotificationType } from "../generated/prisma/client";
import { notificationRepository } from "../repositories/notification.repository";
import { notificationService } from "./notification.service";
import { expectAppErrorAsync } from "../test/helpers";

const userId = "user-1";
const orgId = "org-1";

describe("notificationService.listNotifications", () => {
  beforeEach(() => {
    vi.mocked(notificationRepository.findPaginated).mockReset();
    vi.mocked(notificationRepository.countUnread).mockReset();
  });

  it("returns empty list when organization scope is undefined", async () => {
    const result = await notificationService.listNotifications(userId, undefined, {});

    expect(result.notifications).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(notificationRepository.findPaginated).not.toHaveBeenCalled();
  });

  it("returns paginated notifications", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    vi.mocked(notificationRepository.findPaginated).mockResolvedValue({
      notifications: [
        {
          id: "notification-1",
          type: NotificationType.LEAD_ASSIGNED,
          title: "Lead assigned",
          body: "You were assigned a lead",
          entityType: "lead",
          entityId: "lead-1",
          readAt: null,
          createdAt,
        },
      ],
      total: 1,
    } as never);
    vi.mocked(notificationRepository.countUnread).mockResolvedValue(1);

    const result = await notificationService.listNotifications(userId, orgId, {});

    expect(result.notifications).toHaveLength(1);
    expect(result.meta.unreadCount).toBe(1);
  });
});

describe("notificationService.getUnreadCount", () => {
  it("returns zero when scope is undefined", async () => {
    const result = await notificationService.getUnreadCount(userId, undefined);

    expect(result).toEqual({ count: 0 });
  });
});

describe("notificationService.markRead", () => {
  beforeEach(() => {
    vi.mocked(notificationRepository.markRead).mockReset();
  });

  it("returns not found when scope is undefined", async () => {
    await expectAppErrorAsync(
      () => notificationService.markRead(userId, undefined, "notification-1"),
      404,
      "NOT_FOUND",
    );
  });

  it("returns not found when notification does not exist", async () => {
    vi.mocked(notificationRepository.markRead).mockResolvedValue(null);

    await expectAppErrorAsync(
      () => notificationService.markRead(userId, orgId, "missing"),
      404,
      "NOT_FOUND",
    );
  });
});

describe("notificationService.markAllRead", () => {
  beforeEach(() => {
    vi.mocked(notificationRepository.markAllRead).mockReset();
  });

  it("returns zero updated when scope is undefined", async () => {
    const result = await notificationService.markAllRead(userId, undefined);

    expect(result).toEqual({ updated: 0 });
  });

  it("marks all notifications read in scope", async () => {
    vi.mocked(notificationRepository.markAllRead).mockResolvedValue(3);

    const result = await notificationService.markAllRead(userId, orgId);

    expect(result).toEqual({ updated: 3 });
  });
});

describe("notificationService.createMany", () => {
  it("delegates to repository", async () => {
    await notificationService.createMany([
      {
        userId,
        organizationId: orgId,
        type: NotificationType.LEAD_ASSIGNED,
        title: "Lead assigned",
        body: "Assigned",
      },
    ]);

    expect(notificationRepository.createMany).toHaveBeenCalledOnce();
  });
});
