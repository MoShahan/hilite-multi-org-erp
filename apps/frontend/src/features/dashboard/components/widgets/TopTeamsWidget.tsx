import { TopTeamsTable } from "../TopTeamsTable";

import type { OrgDashboardSummary } from "../../dashboardTypes";

type TopTeamsWidgetProps = {
  summary: OrgDashboardSummary;
};

export const TopTeamsWidget = ({ summary }: TopTeamsWidgetProps) => (
  <TopTeamsTable teams={summary.topTeams} />
);
