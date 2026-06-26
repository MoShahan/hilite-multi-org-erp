import type {
  DashboardLayoutItem,
  DashboardWidgetDefinition,
} from "../constants/dashboardWidgets";
import type { DashboardView } from "../services/dashboardAccess.service";

export type DashboardLayoutResponse = {
  view: DashboardView;
  widgets: DashboardLayoutItem[];
  catalog: DashboardWidgetDefinition[];
};

export type UpdateDashboardLayoutInput = {
  widgets: DashboardLayoutItem[];
};

export type { DashboardLayoutItem, DashboardWidgetDefinition };
