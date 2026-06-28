import { z } from "zod";

import { DASHBOARD_WIDGET_KEYS } from "../dashboardWidgets";

const dashboardWidgetKeySchema = z.enum(
  Object.values(DASHBOARD_WIDGET_KEYS) as [
    (typeof DASHBOARD_WIDGET_KEYS)[keyof typeof DASHBOARD_WIDGET_KEYS],
    ...(typeof DASHBOARD_WIDGET_KEYS)[keyof typeof DASHBOARD_WIDGET_KEYS][],
  ],
);

const dashboardLayoutItemSchema = z.object({
  key: dashboardWidgetKeySchema,
  order: z.number().int().nonnegative(),
  visible: z.boolean(),
});

export const dashboardLayoutUpdateSchema = z.object({
  widgets: z.array(dashboardLayoutItemSchema).min(1, "Widgets array is required"),
});

export type DashboardLayoutUpdateInput = z.infer<
  typeof dashboardLayoutUpdateSchema
>;
