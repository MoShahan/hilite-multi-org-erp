import { TopExecutivesTable } from "../TopExecutivesTable";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopExecutivesWidgetProps = {
  summary: OrgDashboardSummary;
};

export const TopExecutivesWidget = ({ summary }: TopExecutivesWidgetProps) => (
  <TopExecutivesTable executives={summary.topExecutives} />
);
