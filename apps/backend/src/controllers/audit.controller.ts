import type { NextFunction, Request, Response } from "express";
import { auditService } from "../services/audit.service";
import { AppError } from "../utils/AppError";

export const listOrgAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = auditService.requireOrganizationId(
      req.authUser?.organization?.id,
    );

    const result = await auditService.listForOrg(
      organizationId,
      req.query as Record<string, unknown>,
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listPlatformAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await auditService.listForPlatform(
      req.query as Record<string, unknown>,
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
};
