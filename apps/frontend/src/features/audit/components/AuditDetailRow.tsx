import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  formatAuditActionLabel,
  getAuditActionCategory,
  type AuditLog,
} from "../auditTypes";

type AuditDetailRowProps = {
  log: AuditLog;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const DiffSection = ({
  title,
  data,
}: {
  title: string;
  data?: Record<string, unknown>;
}) => {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-2 py-1">
            <span className="font-medium text-muted-foreground">{key}</span>
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {formatValue(value)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuditActionBadge = ({
  action,
}: {
  action: AuditLog["action"];
}) => {
  const category = getAuditActionCategory(action);

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        category === "auth" &&
          "border-blue-500/40 text-blue-700 dark:text-blue-300",
        category === "lead" &&
          "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
        category === "admin" &&
          "border-amber-500/40 text-amber-700 dark:text-amber-300",
      )}
    >
      {formatAuditActionLabel(action)}
    </Badge>
  );
};

export const AuditDetailRow = ({ log }: AuditDetailRowProps) => {
  const { metadata } = log;

  return (
    <div className="space-y-4 border-t bg-muted/20 px-4 py-4">
      <DiffSection title="Before" data={metadata.before} />
      <DiffSection title="After" data={metadata.after} />
      {metadata.changedFields && metadata.changedFields.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Changed fields: {metadata.changedFields.join(", ")}
        </p>
      ) : null}
      {metadata.permissionsAdded && metadata.permissionsAdded.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Permissions added: {metadata.permissionsAdded.join(", ")}
        </p>
      ) : null}
      {metadata.permissionsRemoved && metadata.permissionsRemoved.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Permissions removed: {metadata.permissionsRemoved.join(", ")}
        </p>
      ) : null}
      {metadata.request?.ip || metadata.request?.userAgent ? (
        <div className="text-xs text-muted-foreground">
          {metadata.request.ip ? <p>IP: {metadata.request.ip}</p> : null}
          {metadata.request.userAgent ? (
            <p className="break-all">
              User agent: {metadata.request.userAgent}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
