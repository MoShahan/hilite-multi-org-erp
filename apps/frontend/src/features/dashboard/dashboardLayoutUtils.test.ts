import { describe, expect, it } from "vitest";

import {
  DASHBOARD_WIDGET_KEYS,
  type DashboardWidgetDefinition,
} from "./dashboardLayoutTypes";
import { groupWidgetsForRender } from "./dashboardLayoutUtils";

const catalog: DashboardWidgetDefinition[] = [
  {
    key: DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
    label: "Conversion overview",
    description: "",
    width: "full",
  },
  {
    key: DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
    label: "Lead status",
    description: "",
    width: "half",
  },
  {
    key: DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
    label: "Recent activities",
    description: "",
    width: "half",
  },
  {
    key: DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
    label: "Pipeline stats",
    description: "",
    width: "full",
  },
];

describe("groupWidgetsForRender", () => {
  it("skips hidden widgets", () => {
    const rows = groupWidgetsForRender(
      [
        {
          key: DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
          order: 0,
          visible: true,
        },
        {
          key: DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
          order: 1,
          visible: false,
        },
        {
          key: DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
          order: 2,
          visible: true,
        },
      ],
      catalog,
    );

    expect(rows).toEqual([
      { type: "full", key: DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW },
      { type: "full", key: DASHBOARD_WIDGET_KEYS.PIPELINE_STATS },
    ]);
  });

  it("pairs consecutive half-width widgets", () => {
    const rows = groupWidgetsForRender(
      [
        {
          key: DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
          order: 0,
          visible: true,
        },
        {
          key: DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
          order: 1,
          visible: true,
        },
      ],
      catalog,
    );

    expect(rows).toEqual([
      {
        type: "half",
        keys: [
          DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
          DASHBOARD_WIDGET_KEYS.RECENT_ACTIVITIES,
        ],
      },
    ]);
  });

  it("renders a lone half-width widget as half-single", () => {
    const rows = groupWidgetsForRender(
      [
        {
          key: DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN,
          order: 0,
          visible: true,
        },
        {
          key: DASHBOARD_WIDGET_KEYS.PIPELINE_STATS,
          order: 1,
          visible: true,
        },
      ],
      catalog,
    );

    expect(rows).toEqual([
      { type: "half-single", key: DASHBOARD_WIDGET_KEYS.STATUS_BREAKDOWN },
      { type: "full", key: DASHBOARD_WIDGET_KEYS.PIPELINE_STATS },
    ]);
  });
});
