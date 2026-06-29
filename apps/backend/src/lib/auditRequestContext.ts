import type { AuditRequestContext } from "../types/audit";
import type { Request } from "express";

export const getAuditRequestContext = (req: Request): AuditRequestContext => ({
  ip: req.ip,
  userAgent: req.get("user-agent") ?? undefined,
});
