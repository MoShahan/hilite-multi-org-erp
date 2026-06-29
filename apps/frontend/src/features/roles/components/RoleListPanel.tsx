import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getMembershipScopeLabel } from "../permissionScopeUtils";

import type { Role } from "../rolesTypes";

type RoleListPanelProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
};

export const RoleListPanel = ({
  roles,
  selectedRoleId,
  onSelectRole,
}: RoleListPanelProps) => {
  return (
    <div className="flex h-full flex-col border-r bg-muted/20">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Roles
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;

            return (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => onSelectRole(role.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-accent font-medium shadow-sm"
                      : "hover:bg-accent/60",
                  )}
                >
                  <div className="min-w-0">
                    <span className="block truncate">{role.name}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {getMembershipScopeLabel(role.membershipScope)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {role.isProtected ? (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] font-normal"
                      >
                        Default
                      </Badge>
                    ) : null}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {role.userCount}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
