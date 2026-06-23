import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PermissionToggleRowProps = {
  label: string;
  description?: string | null;
  checked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  badge?: string;
  onCheckedChange: (checked: boolean) => void;
};

export const PermissionToggleRow = ({
  label,
  description,
  checked,
  disabled = false,
  disabledReason,
  badge,
  onCheckedChange,
}: PermissionToggleRowProps) => {
  const id = `permission-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const switchControl = (
    <Switch
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className="mt-0.5"
    />
  );

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border bg-background/60 px-4 py-3",
        disabled && "opacity-70",
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          {badge ? (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
              {badge}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {disabled && disabledReason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{switchControl}</span>
          </TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        switchControl
      )}
    </div>
  );
};
