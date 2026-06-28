import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { dashboardWidgetCardClassName } from "./DashboardStatGrid";

type DashboardWidgetCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export const DashboardWidgetCard = ({
  title,
  description,
  children,
  className,
  contentClassName,
}: DashboardWidgetCardProps) => (
  <Card className={cn(dashboardWidgetCardClassName, className)}>
    <div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 opacity-50 blur-3xl"
    />
    <CardHeader className="relative border-b border-border/50 pb-4">
      <CardTitle className="text-base font-semibold tracking-tight">
        {title}
      </CardTitle>
      {description ? (
        <CardDescription className="text-sm">{description}</CardDescription>
      ) : null}
    </CardHeader>
    <CardContent className={cn("relative pt-5", contentClassName)}>
      {children}
    </CardContent>
  </Card>
);
