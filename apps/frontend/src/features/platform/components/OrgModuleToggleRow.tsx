import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { OrgModuleCatalogItem } from "../platformTypes";

type OrgModuleToggleRowProps = {
  item: OrgModuleCatalogItem;
  enabled: boolean;
  disabled?: boolean;
  onCheckedChange: (enabled: boolean) => void;
};

export const OrgModuleToggleRow = ({
  item,
  enabled,
  disabled = false,
  onCheckedChange,
}: OrgModuleToggleRowProps) => {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
      <div className="space-y-1">
        <Label htmlFor={`module-${item.key}`} className="text-base font-medium">
          {item.label}
        </Label>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        {!enabled ? (
          <p className="text-xs text-muted-foreground">{item.disableHint}</p>
        ) : null}
      </div>
      <Switch
        id={`module-${item.key}`}
        checked={enabled}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={`Toggle ${item.label}`}
      />
    </div>
  );
};
