import type {
  DashboardLayoutItem,
  DashboardWidgetDefinition,
  DashboardWidgetKey,
} from "./dashboardLayoutTypes";

export type DashboardRenderRow =
  | { type: "full"; key: DashboardWidgetKey }
  | { type: "half"; keys: [DashboardWidgetKey, DashboardWidgetKey] }
  | { type: "half-single"; key: DashboardWidgetKey };

const getWidgetWidth = (
  key: DashboardWidgetKey,
  catalog: DashboardWidgetDefinition[],
): "full" | "half" =>
  catalog.find((item) => item.key === key)?.width ?? "full";

export const groupWidgetsForRender = (
  widgets: DashboardLayoutItem[],
  catalog: DashboardWidgetDefinition[],
): DashboardRenderRow[] => {
  const visible = [...widgets]
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const rows: DashboardRenderRow[] = [];
  let index = 0;

  while (index < visible.length) {
    const current = visible[index];
    const width = getWidgetWidth(current.key, catalog);

    if (width === "full") {
      rows.push({ type: "full", key: current.key });
      index += 1;
      continue;
    }

    const next = visible[index + 1];
    if (next && getWidgetWidth(next.key, catalog) === "half") {
      rows.push({ type: "half", keys: [current.key, next.key] });
      index += 2;
      continue;
    }

    rows.push({ type: "half-single", key: current.key });
    index += 1;
  }

  return rows;
};
