import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSIONS } from "@/constants/permissions";
import { selectHasPermission } from "@/features/auth/authSelectors";
import { ApiClientError } from "@/lib/api-client";

import { OrgModuleToggleRow } from "./OrgModuleToggleRow";
import { platformService } from "../platformService";

import type {
  OrganizationModulesMap,
  OrganizationModulesResponse,
} from "../platformTypes";

type OrganizationModulesPanelProps = {
  organizationId: string;
};

export const OrganizationModulesPanel = ({
  organizationId,
}: OrganizationModulesPanelProps) => {
  const canWrite = useAppSelector(selectHasPermission(PERMISSIONS.PLATFORM_ORGS_WRITE));
  const [data, setData] = useState<OrganizationModulesResponse | null>(null);
  const [draft, setDraft] = useState<OrganizationModulesMap | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    void platformService
      .getOrganizationModules(organizationId)
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setDraft(response.modules);
          setStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const handleToggle = (key: keyof OrganizationModulesMap, enabled: boolean) => {
    setDraft((current) => (current ? { ...current, [key]: enabled } : current));
  };

  const handleSave = async () => {
    if (!draft || !data) {
      return;
    }

    const updates = Object.fromEntries(
      Object.entries(draft).filter(
        ([key, value]) =>
          data.modules[key as keyof OrganizationModulesMap] !== value,
      ),
    ) as Partial<OrganizationModulesMap>;

    if (Object.keys(updates).length === 0) {
      toast.message("No changes to save");
      return;
    }

    setSaving(true);

    try {
      const response = await platformService.updateOrganizationModules(
        organizationId,
        updates,
      );
      setData(response);
      setDraft(response.modules);
      toast.success("Organization modules updated");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update organization modules";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    draft &&
    data &&
    Object.keys(draft).some(
      (key) =>
        draft[key as keyof OrganizationModulesMap] !==
        data.modules[key as keyof OrganizationModulesMap],
    );

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-destructive">
        Failed to load organization modules. Please try again.
      </p>
    );
  }

  if (!draft || !data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.catalog.map((item) => (
        <OrgModuleToggleRow
          key={item.key}
          item={item}
          enabled={draft[item.key]}
          disabled={!canWrite || saving}
          onCheckedChange={(enabled) => handleToggle(item.key, enabled)}
        />
      ))}
      {canWrite ? (
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => void handleSave()}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
