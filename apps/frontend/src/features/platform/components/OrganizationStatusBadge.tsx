import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { OrganizationStatus } from "../platformTypes";

type OrganizationStatusBadgeProps = {
  status: OrganizationStatus;
  className?: string;
};

export const OrganizationStatusBadge = ({
  status,
  className,
}: OrganizationStatusBadgeProps) => {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
        isActive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-amber-500",
        )}
      />
      {isActive ? "Active" : "Suspended"}
    </Badge>
  );
};
