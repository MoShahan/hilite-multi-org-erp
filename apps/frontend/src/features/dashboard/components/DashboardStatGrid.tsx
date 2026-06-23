import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  className?: string;
};

export const DashboardStatCard = ({
  label,
  value,
  description,
  className,
}: DashboardStatCardProps) => (
  <Card className={cn("shadow-sm", className)}>
    <CardHeader className="pb-2">
      <CardDescription className="text-xs font-medium tracking-wide uppercase">
        {label}
      </CardDescription>
      <CardTitle className="text-3xl font-semibold tracking-tight">
        {value}
      </CardTitle>
    </CardHeader>
    {description ? (
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    ) : null}
  </Card>
);

type DashboardStatGridProps = {
  children: ReactNode;
};

export const DashboardStatGrid = ({ children }: DashboardStatGridProps) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
);
