export const ORG_MODULE_KEYS = {
  SALES_ERP: "sales_erp",
  DASHBOARDS: "dashboards",
  NOTIFICATIONS: "notifications",
} as const;

export type OrgModuleKey =
  (typeof ORG_MODULE_KEYS)[keyof typeof ORG_MODULE_KEYS];

export const NO_FEATURES_COPY = {
  title: "No features available",
  description: "There is nothing available for you to access right now.",
};
