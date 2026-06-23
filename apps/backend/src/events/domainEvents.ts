import type { ActivityType, LeadStatus } from "../generated/prisma/client";

export type DomainEventMap = {
  LEAD_CREATED: LeadCreatedEvent;
  LEAD_ASSIGNED: LeadAssignedEvent;
  LEAD_REASSIGNED: LeadReassignedEvent;
  LEAD_STATUS_CHANGED: LeadStatusChangedEvent;
  ACTIVITY_LOGGED: ActivityLoggedEvent;
};

export type DomainEventName = keyof DomainEventMap;

type BaseLeadEvent = {
  organizationId: string;
  leadId: string;
  leadName: string;
  teamId: string;
  actorId: string;
};

export type LeadCreatedEvent = BaseLeadEvent;

export type LeadAssignedEvent = BaseLeadEvent & {
  assigneeId: string;
};

export type LeadReassignedEvent = BaseLeadEvent & {
  previousAssigneeId: string;
};

export type LeadStatusChangedEvent = BaseLeadEvent & {
  assigneeId: string;
  status: LeadStatus;
  previousStatus: LeadStatus;
};

export type ActivityLoggedEvent = BaseLeadEvent & {
  actorName: string;
  activityType: ActivityType;
};
