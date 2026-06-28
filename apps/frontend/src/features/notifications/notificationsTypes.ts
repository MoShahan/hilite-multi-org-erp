export type NotificationListFilter = "all" | "unread";

export type NotificationListQuery = {
  filter: NotificationListFilter;
  page: number;
  pageSize: number;
};

export type NotificationType =
  | "LEAD_CREATED"
  | "LEAD_ASSIGNED"
  | "LEAD_REASSIGNED"
  | "LEAD_STATUS_CHANGED"
  | "ACTIVITY_LOGGED"
  | "WELCOME_CHANGE_PASSWORD";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount: number;
};

export type ListNotificationsResult = {
  notifications: Notification[];
  meta: NotificationListMeta;
};

export type NotificationsState = {
  notifications: Notification[];
  listMeta: NotificationListMeta | null;
  listQuery: NotificationListQuery | null;
  unreadCount: number;
  listStatus: "idle" | "loading" | "success" | "error";
  unreadStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
  mutationStatus: "idle" | "loading";
  lastFetchedAt: string | null;
};
