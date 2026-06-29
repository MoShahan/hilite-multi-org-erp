import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DASHBOARD_WIDGET_KEYS } from "../../dashboardLayoutTypes";
import { renderDashboardWidget } from "./widgetRegistry";

const mockSummary = {
  view: "me" as const,
  conversion: {
    totalLeads: 10,
    wonLeads: 4,
    lostLeads: 2,
    openLeads: 4,
    winRate: 67,
  },
  totalActivities: 5,
  statusBreakdown: [],
  recentActivities: [],
  assigneeLeaderboard: [],
  topTeams: [],
  topExecutives: [],
};

describe("renderDashboardWidget", () => {
  it("renders known widget components", () => {
    render(
      <>{renderDashboardWidget(DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW, mockSummary)}</>,
    );

    expect(screen.getByText("Assigned leads")).toBeInTheDocument();
  });

  it("returns null for unknown widget keys", () => {
    const result = renderDashboardWidget(
      "unknown_widget" as typeof DASHBOARD_WIDGET_KEYS.CONVERSION_OVERVIEW,
      mockSummary,
    );

    expect(result).toBeNull();
  });
});
