import { NotificationType } from "../generated/prisma/client";
import { logger } from "../lib/logger";
import { notificationRepository } from "../repositories/notification.repository";

import { notificationService } from "./notification.service";

const ACCOUNT_ENTITY_TYPE = "account";

const WELCOME_TITLE = "Welcome! Change your password";

const buildWelcomeBody = (name: string) =>
  `Hi ${name}, your account was created with a default password. Please go to Account settings and change it to keep your account secure.`;

const createWelcomeNotification = async (
  organizationId: string | null,
  userId: string,
  name: string,
): Promise<void> => {
  await notificationService.createMany([
    {
      organizationId,
      userId,
      type: NotificationType.WELCOME_CHANGE_PASSWORD,
      title: WELCOME_TITLE,
      body: buildWelcomeBody(name),
      entityType: ACCOUNT_ENTITY_TYPE,
    },
  ]);
};

export const welcomeNotificationService = {
  notifyNewUser: async (
    userId: string,
    organizationId: string | null | undefined,
    name: string,
  ): Promise<void> => {
    const scope = organizationId ?? null;

    try {
      await createWelcomeNotification(scope, userId, name);
    } catch (error) {
      logger.error("Failed to create welcome notification for new user", {
        userId,
        organizationId: scope,
        err: error,
      });
    }
  },

  ensureOnLogin: async (
    userId: string,
    organizationId: string | null | undefined,
    name: string,
    mustChangePassword: boolean,
  ): Promise<void> => {
    if (!mustChangePassword) {
      return;
    }

    const scope = organizationId ?? null;

    try {
      const hasWelcomeNotification =
        await notificationRepository.hasWelcomeChangePasswordNotification(
          userId,
          scope,
        );

      if (hasWelcomeNotification) {
        return;
      }

      await createWelcomeNotification(scope, userId, name);
    } catch (error) {
      logger.error("Failed to ensure welcome notification on login", {
        userId,
        organizationId: scope,
        err: error,
      });
    }
  },
};
