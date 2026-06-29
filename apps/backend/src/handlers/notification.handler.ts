import {
  ACTIVITY_TYPE_NOTIFY_LABELS,
  LEAD_STATUS_LABELS,
} from "@hilite/shared";

import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { NotificationType } from "../generated/prisma/client";
import { logger } from "../lib/logger";
import { notificationRepository } from "../repositories/notification.repository";
import { notificationService } from "../services/notification.service";
import { organizationModuleService } from "../services/organizationModule.service";

import type {
  ActivityLoggedEvent,
  LeadAssignedEvent,
  LeadCreatedEvent,
  LeadReassignedEvent,
  LeadStatusChangedEvent,
} from "../events/domainEvents";
import type { CreateNotificationInput } from "../types/notification";

const LEAD_ENTITY_TYPE = "lead";

const excludeActor = (userIds: string[], actorId: string): string[] =>
  userIds.filter((id) => id !== actorId);

const buildLeadEntity = (leadId: string) => ({
  entityType: LEAD_ENTITY_TYPE,
  entityId: leadId,
});

const notifyUsers = async (
  organizationId: string,
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  leadId: string,
): Promise<void> => {
  const notificationsEnabled = await organizationModuleService.isModuleEnabled(
    organizationId,
    ORG_MODULE_KEYS.NOTIFICATIONS,
  );

  if (!notificationsEnabled) {
    return;
  }

  const uniqueUserIds = [...new Set(userIds)];

  if (uniqueUserIds.length === 0) {
    return;
  }

  const inputs: CreateNotificationInput[] = uniqueUserIds.map((userId) => ({
    organizationId,
    userId,
    type,
    title,
    body,
    ...buildLeadEntity(leadId),
  }));

  await notificationService.createMany(inputs);
};

const handleLeadCreated = async (event: LeadCreatedEvent): Promise<void> => {
  const teamLeadIds = await notificationRepository.findTeamLeadUserIds(
    event.teamId,
    event.organizationId,
  );
  const recipients = excludeActor(teamLeadIds, event.actorId);

  await notifyUsers(
    event.organizationId,
    recipients,
    NotificationType.LEAD_CREATED,
    "New unassigned lead",
    `${event.leadName} was added to your team and needs assignment`,
    event.leadId,
  );
};

const handleLeadAssigned = async (event: LeadAssignedEvent): Promise<void> => {
  if (event.assigneeId === event.actorId) {
    return;
  }

  await notifyUsers(
    event.organizationId,
    [event.assigneeId],
    NotificationType.LEAD_ASSIGNED,
    "Lead assigned to you",
    `${event.leadName} has been assigned to you`,
    event.leadId,
  );
};

const handleLeadReassigned = async (
  event: LeadReassignedEvent,
): Promise<void> => {
  if (event.previousAssigneeId === event.actorId) {
    return;
  }

  await notifyUsers(
    event.organizationId,
    [event.previousAssigneeId],
    NotificationType.LEAD_REASSIGNED,
    "Lead reassigned",
    `${event.leadName} is no longer assigned to you`,
    event.leadId,
  );
};

const handleLeadStatusChanged = async (
  event: LeadStatusChangedEvent,
): Promise<void> => {
  if (!event.assigneeId || event.assigneeId === event.actorId) {
    return;
  }

  const statusLabel = LEAD_STATUS_LABELS[event.status];

  await notifyUsers(
    event.organizationId,
    [event.assigneeId],
    NotificationType.LEAD_STATUS_CHANGED,
    "Lead status updated",
    `${event.leadName} is now ${statusLabel}`,
    event.leadId,
  );
};

const handleActivityLogged = async (
  event: ActivityLoggedEvent,
): Promise<void> => {
  const teamLeadIds = await notificationRepository.findTeamLeadUserIds(
    event.teamId,
    event.organizationId,
  );

  if (teamLeadIds.includes(event.actorId)) {
    return;
  }

  const recipients = excludeActor(teamLeadIds, event.actorId);
  const activityLabel = ACTIVITY_TYPE_NOTIFY_LABELS[event.activityType];

  await notifyUsers(
    event.organizationId,
    recipients,
    NotificationType.ACTIVITY_LOGGED,
    "New activity on lead",
    `${event.actorName} logged a ${activityLabel} on ${event.leadName}`,
    event.leadId,
  );
};

const safeHandler =
  <T>(name: string, handler: (event: T) => Promise<void>) =>
  async (event: T): Promise<void> => {
    try {
      await handler(event);
    } catch (error) {
      logger.error("Notification handler failed", {
        handler: name,
        err: error,
      });
    }
  };

export const registerNotificationHandlers = (
  on: <K extends import("../events/domainEvents").DomainEventName>(
    event: K,
    handler: (
      payload: import("../events/domainEvents").DomainEventMap[K],
    ) => void | Promise<void>,
  ) => void,
): void => {
  on("LEAD_CREATED", safeHandler("LEAD_CREATED", handleLeadCreated));
  on("LEAD_ASSIGNED", safeHandler("LEAD_ASSIGNED", handleLeadAssigned));
  on("LEAD_REASSIGNED", safeHandler("LEAD_REASSIGNED", handleLeadReassigned));
  on(
    "LEAD_STATUS_CHANGED",
    safeHandler("LEAD_STATUS_CHANGED", handleLeadStatusChanged),
  );
  on("ACTIVITY_LOGGED", safeHandler("ACTIVITY_LOGGED", handleActivityLogged));
};
