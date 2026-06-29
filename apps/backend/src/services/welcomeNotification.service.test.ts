import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("../repositories/notification.repository", () => ({
  notificationRepository: {
    hasWelcomeChangePasswordNotification: vi.fn(),
  },
}));

vi.mock("./notification.service", () => ({
  notificationService: {
    createMany: vi.fn(),
  },
}));

import { notificationRepository } from "../repositories/notification.repository";
import { notificationService } from "./notification.service";
import { welcomeNotificationService } from "./welcomeNotification.service";

describe("welcomeNotificationService.ensureOnLogin", () => {
  beforeEach(() => {
    vi.mocked(
      notificationRepository.hasWelcomeChangePasswordNotification,
    ).mockReset();
    vi.mocked(notificationService.createMany).mockReset();
  });

  it("skips when password change is not required", async () => {
    await welcomeNotificationService.ensureOnLogin(
      "user-1",
      "org-1",
      "Alice",
      false,
    );

    expect(
      notificationRepository.hasWelcomeChangePasswordNotification,
    ).not.toHaveBeenCalled();
  });

  it("creates welcome notification when required and missing", async () => {
    vi.mocked(
      notificationRepository.hasWelcomeChangePasswordNotification,
    ).mockResolvedValue(false);

    await welcomeNotificationService.ensureOnLogin(
      "user-1",
      "org-1",
      "Alice",
      true,
    );

    expect(notificationService.createMany).toHaveBeenCalledOnce();
  });

  it("does not duplicate existing welcome notification", async () => {
    vi.mocked(
      notificationRepository.hasWelcomeChangePasswordNotification,
    ).mockResolvedValue(true);

    await welcomeNotificationService.ensureOnLogin(
      "user-1",
      "org-1",
      "Alice",
      true,
    );

    expect(notificationService.createMany).not.toHaveBeenCalled();
  });
});
