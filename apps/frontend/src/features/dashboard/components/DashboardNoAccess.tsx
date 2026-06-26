import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/app/hooks";
import {
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";

export const DashboardNoAccess = () => {
  const canViewUsers = useAppSelector(selectHasPermission("users:read"));
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const canViewLeads = useAppSelector(
    selectHasAnyPermission([
      "leads:read",
      "leads:read:team",
      "leads:read:org",
    ]),
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          Sales analytics are available for users with personal, team, or
          organization dashboard access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your role does not include a sales dashboard. Use the sections below
          to manage the organization.
        </p>
        <div className="flex flex-wrap gap-2">
          {hasSalesErpModule && canViewLeads ? (
            <Button variant="outline" asChild>
              <Link to="/leads">View leads</Link>
            </Button>
          ) : null}
          {canViewUsers ? (
            <Button variant="outline" asChild>
              <Link to="/users">Manage users</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
