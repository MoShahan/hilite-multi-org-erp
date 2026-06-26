import type { Request } from "express";
import type { AuditRequestContext } from "../types/audit";

export const getAuditRequestContext = (req: Request): AuditRequestContext => ({
  ip: req.ip,
  userAgent: req.get("user-agent") ?? undefined,
});
