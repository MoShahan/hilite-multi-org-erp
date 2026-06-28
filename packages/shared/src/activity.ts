export type ActivityType =
  | "CALL"
  | "EMAIL"
  | "OFFLINE_MEETING"
  | "NOTE"
  | "ONLINE_MEETING"
  | "SITE_VISIT"
  | "MESSAGE";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CALL: "Call",
  EMAIL: "Email",
  OFFLINE_MEETING: "Offline meeting",
  NOTE: "Note",
  ONLINE_MEETING: "Online meeting",
  SITE_VISIT: "Site visit",
  MESSAGE: "Message",
};

export const ACTIVITY_TYPE_NOTIFY_LABELS: Record<ActivityType, string> = {
  CALL: "call",
  EMAIL: "email",
  OFFLINE_MEETING: "offline meeting",
  NOTE: "note",
  ONLINE_MEETING: "online meeting",
  SITE_VISIT: "site visit",
  MESSAGE: "message",
};
