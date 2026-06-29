import { groupWidgetsForRender } from "../dashboardLayoutUtils";

import { renderDashboardWidget } from "./widgets/widgetRegistry";

import type {
  DashboardLayoutResponse,
  DashboardWidgetKey,
} from "../dashboardLayoutTypes";
import type { DashboardSummaryResponse } from "../dashboardTypes";

type DashboardGridProps = {
  layout: DashboardLayoutResponse;
  summary: DashboardSummaryResponse;
};

export const DashboardGrid = ({ layout, summary }: DashboardGridProps) => {
  const rows = groupWidgetsForRender(layout.widgets, layout.catalog);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
        No widgets are visible. Use Customize to enable dashboard sections.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rows.map((row) => {
        if (row.type === "full") {
          return (
            <div key={row.key}>{renderDashboardWidget(row.key, summary)}</div>
          );
        }

        if (row.type === "half-single") {
          return (
            <div key={row.key} className="grid gap-6 md:grid-cols-2">
              <div>{renderDashboardWidget(row.key, summary)}</div>
            </div>
          );
        }

        return (
          <div
            key={`${row.keys[0]}-${row.keys[1]}`}
            className="grid gap-6 md:grid-cols-2"
          >
            {row.keys.map((key: DashboardWidgetKey) => (
              <div key={key}>{renderDashboardWidget(key, summary)}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
