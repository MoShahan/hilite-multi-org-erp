import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { LEAD_STATUS_LABELS } from "../leadStatusPipeline";

import type { LeadStatus } from "../leadsTypes";

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  CONTACTED:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  NEGOTIATION:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  WON: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  LOST: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  SITE_VISIT_COMPLETED:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  VISIT_SCHEDULED:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
};

export const LEAD_STATUS_BADGE_STYLES = STATUS_STYLES;

type LeadStatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

export const LeadStatusBadge = ({ status, className }: LeadStatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn("font-medium", STATUS_STYLES[status], className)}
  >
    {LEAD_STATUS_LABELS[status]}
  </Badge>
);
