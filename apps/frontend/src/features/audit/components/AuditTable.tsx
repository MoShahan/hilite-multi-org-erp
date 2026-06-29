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
};

const headerClassName =
  "h-11 bg-muted/40 text-xs font-semibold tracking-wide uppercase text-muted-foreground";

export const AuditTable = ({ auditLogs }: AuditTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table className="w-max min-w-full">
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="h-11 w-12 bg-muted/40" />
            <TableHead className={headerClassName}>Time</TableHead>
            <TableHead className={headerClassName}>Actor</TableHead>
            <TableHead className={headerClassName}>Action</TableHead>
            <TableHead className={headerClassName}>Entity</TableHead>
            <TableHead className={headerClassName}>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map((log) => {
            const isExpanded = expandedId === log.id;

            return (
              <Fragment key={log.id}>
                <TableRow className="transition-colors hover:bg-muted/40">
                  <TableCell className="py-3">
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
                  <TableCell className="py-3 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    <div className="font-medium">
                      {log.actor?.name ?? "System"}
                    </div>
                    {log.actor?.email ? (
                      <div className="text-xs text-muted-foreground">
                        {log.actor.email}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-3">
                    <AuditActionBadge action={log.action} />
                  </TableCell>
                  <TableCell className="py-3 text-sm capitalize">
                    {log.entityType}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {log.metadata.summary}
                  </TableCell>
                </TableRow>
                {isExpanded ? (
                  <TableRow key={`${log.id}-detail`}>
                    <TableCell colSpan={6} className="p-0">
                      <AuditDetailRow log={log} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
