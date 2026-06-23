import { ModuleKey } from "../generated/prisma/client";

export const ORG_MODULE_KEYS = {
  SALES_ERP: "sales_erp",
  DASHBOARDS: "dashboards",
  NOTIFICATIONS: "notifications",
} as const;

export type OrgModuleKey =
  (typeof ORG_MODULE_KEYS)[keyof typeof ORG_MODULE_KEYS];

export const ALL_ORG_MODULE_KEYS: OrgModuleKey[] = Object.values(ORG_MODULE_KEYS);

export const ORG_MODULE_CATALOG: {
  key: OrgModuleKey;
  label: string;
  description: string;
  disableHint: string;
}[] = [
  {
    key: ORG_MODULE_KEYS.SALES_ERP,
    label: "Sales ERP",
    description: "Leads pipeline and activity logging for your sales team.",
    disableHint:
      "Users will not be able to manage leads or log activities. Dashboards and notifications are not affected.",
  },
  {
    key: ORG_MODULE_KEYS.DASHBOARDS,
    label: "Dashboards",
    description: "Role-based sales analytics and performance summaries.",
    disableHint:
      "Dashboard will show a disabled message. Other features are not affected.",
  },
  {
    key: ORG_MODULE_KEYS.NOTIFICATIONS,
    label: "Notifications",
    description: "In-app alerts for lead assignments, status changes, and activities.",
    disableHint:
      "The notification bell will be hidden and no new alerts will be created.",
  },
];

const MODULE_KEY_TO_DB: Record<OrgModuleKey, ModuleKey> = {
  [ORG_MODULE_KEYS.SALES_ERP]: ModuleKey.SALES_ERP,
  [ORG_MODULE_KEYS.DASHBOARDS]: ModuleKey.DASHBOARDS,
  [ORG_MODULE_KEYS.NOTIFICATIONS]: ModuleKey.NOTIFICATIONS,
};

const DB_TO_MODULE_KEY: Record<ModuleKey, OrgModuleKey> = {
  [ModuleKey.SALES_ERP]: ORG_MODULE_KEYS.SALES_ERP,
  [ModuleKey.DASHBOARDS]: ORG_MODULE_KEYS.DASHBOARDS,
  [ModuleKey.NOTIFICATIONS]: ORG_MODULE_KEYS.NOTIFICATIONS,
};

export const toDbModuleKey = (key: OrgModuleKey): ModuleKey =>
  MODULE_KEY_TO_DB[key];

export const fromDbModuleKey = (key: ModuleKey): OrgModuleKey =>
  DB_TO_MODULE_KEY[key];

export const MODULE_DISABLED_MESSAGES: Record<OrgModuleKey, string> = {
  [ORG_MODULE_KEYS.SALES_ERP]: "Sales operations are not available",
  [ORG_MODULE_KEYS.DASHBOARDS]: "Dashboard is not available",
  [ORG_MODULE_KEYS.NOTIFICATIONS]: "Notifications are not available",
};
