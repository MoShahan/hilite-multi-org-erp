import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { UserStatus } from "../usersTypes";

type UserStatusBadgeProps = {
  status: UserStatus;
  className?: string;
};

export const UserStatusBadge = ({
  status,
  className,
}: UserStatusBadgeProps) => {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        isActive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};
