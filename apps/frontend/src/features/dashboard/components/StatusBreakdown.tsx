import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { LEAD_STATUS_LABELS } from "../dashboardTypes";

import type { StatusBreakdownItem } from "../dashboardTypes";

type StatusBreakdownProps = {
  items: StatusBreakdownItem[];
};

export const StatusBreakdown = ({ items }: StatusBreakdownProps) => {
  if (items.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lead status</CardTitle>
          <CardDescription>Distribution of leads by status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leads in scope yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Lead status</CardTitle>
        <CardDescription>Distribution of leads by status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.status} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {LEAD_STATUS_LABELS[item.status]}
              </span>
              <span className="text-muted-foreground">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-primary transition-all")}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
