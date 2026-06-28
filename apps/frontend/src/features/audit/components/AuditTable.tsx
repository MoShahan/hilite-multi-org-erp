import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/lib/format";

import { AuditActionBadge, AuditDetailRow } from "./AuditDetailRow";

import type { AuditLog } from "../auditTypes";

type AuditTableProps = {
  auditLogs: AuditLog[];
  showOrganization?: boolean;
};

export const AuditTable = ({
  auditLogs,
  showOrganization = false,
}: AuditTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Time</TableHead>
          {showOrganization ? <TableHead>Organization</TableHead> : null}
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {auditLogs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <Fragment key={log.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : log.id)
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                {showOrganization ? (
                  <TableCell className="text-sm">
                    {log.organization?.name ?? "—"}
                  </TableCell>
                ) : null}
                <TableCell className="text-sm">
                  <div className="font-medium">{log.actor?.name ?? "System"}</div>
                  {log.actor?.email ? (
                    <div className="text-xs text-muted-foreground">
                      {log.actor.email}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <AuditActionBadge action={log.action} />
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {log.entityType}
                </TableCell>
                <TableCell className="max-w-md text-sm">
                  {log.metadata.summary}
                </TableCell>
              </TableRow>
              {isExpanded ? (
                <TableRow key={`${log.id}-detail`}>
                  <TableCell
                    colSpan={showOrganization ? 7 : 6}
                    className="p-0"
                  >
                    <AuditDetailRow log={log} />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};
