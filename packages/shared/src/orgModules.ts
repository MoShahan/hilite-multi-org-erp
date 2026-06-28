export const ORG_MODULE_KEYS = {
  SALES_ERP: "sales_erp",
  DASHBOARDS: "dashboards",
  NOTIFICATIONS: "notifications",
} as const;

export type OrgModuleKey =
  (typeof ORG_MODULE_KEYS)[keyof typeof ORG_MODULE_KEYS];

export const ALL_ORG_MODULE_KEYS: OrgModuleKey[] = Object.values(ORG_MODULE_KEYS);
