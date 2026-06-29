import {
  Activity,
  AlertTriangle,
  CircleCheck,
  Target,
  TrendingDown,
  Trophy,
  UserMinus,
  Users,
  Workflow,
} from "lucide-react";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardTone = "primary" | "success" | "warning" | "danger" | "neutral" | "info";

const toneStyles: Record<
  StatCardTone,
  { icon: string; glow: string; iconBg: string }
> = {
  primary: {
    icon: "text-primary",
    glow: "bg-primary/25",
    iconBg: "bg-primary/10",
  },
  success: {
    icon: "text-emerald-500 dark:text-emerald-400",
    glow: "bg-emerald-500/20",
    iconBg: "bg-emerald-500/10",
  },
  warning: {
    icon: "text-amber-500 dark:text-amber-400",
    glow: "bg-amber-500/20",
    iconBg: "bg-amber-500/10",
  },
  danger: {
    icon: "text-destructive",
    glow: "bg-destructive/20",
    iconBg: "bg-destructive/10",
  },
  neutral: {
    icon: "text-muted-foreground",
    glow: "bg-muted-foreground/15",
    iconBg: "bg-muted",
  },
  info: {
    icon: "text-sky-500 dark:text-sky-400",
    glow: "bg-sky-500/20",
    iconBg: "bg-sky-500/10",
  },
};

const labelConfig: Record<string, { icon: LucideIcon; tone: StatCardTone }> = {
  "assigned leads": { icon: Users, tone: "primary" },
  "leads in team": { icon: Users, tone: "primary" },
  "organization leads": { icon: Users, tone: "primary" },
  "open pipeline": { icon: Workflow, tone: "info" },
  "win rate": { icon: Target, tone: "success" },
  activities: { icon: Activity, tone: "neutral" },
  "team activities": { icon: Activity, tone: "neutral" },
  "organization activities": { icon: Activity, tone: "neutral" },
  "needs attention": { icon: AlertTriangle, tone: "warning" },
  won: { icon: Trophy, tone: "success" },
  lost: { icon: TrendingDown, tone: "danger" },
  closed: { icon: CircleCheck, tone: "neutral" },
  unassigned: { icon: UserMinus, tone: "warning" },
};

const resolveStatCardConfig = (
  label: string,
  icon?: LucideIcon,
  tone?: StatCardTone,
) => {
  const preset = labelConfig[label.toLowerCase()];

  return {
    icon: icon ?? preset?.icon ?? Users,
    tone: tone ?? preset?.tone ?? "neutral",
  };
};

type DashboardStatCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  className?: string;
  icon?: LucideIcon;
  tone?: StatCardTone;
};

export const dashboardWidgetCardClassName =
  "relative overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md";

export const DashboardStatCard = ({
  label,
  value,
  description,
  className,
  icon,
  tone,
}: DashboardStatCardProps) => {
  const { icon: Icon, tone: resolvedTone } = resolveStatCardConfig(
    label,
    icon,
    tone,
  );
  const styles = toneStyles[resolvedTone];

  return (
    <Card
      className={cn(
        dashboardWidgetCardClassName,
        "group/stat-card gap-0 py-0",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-28 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover/stat-card:opacity-90",
          styles.glow,
        )}
      />
      <CardHeader className="relative gap-3 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-foreground/5",
              styles.iconBg,
            )}
          >
            <Icon className={cn("size-4", styles.icon)} strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </CardTitle>
        </div>
      </CardHeader>
      {description ? (
        <CardContent className="relative border-t border-border/50 pb-5 pt-3">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      ) : (
        <div className="pb-5" />
      )}
    </Card>
  );
};

type DashboardStatGridProps = {
  children: ReactNode;
};

export const DashboardStatGrid = ({ children }: DashboardStatGridProps) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
);
