import type { NextFunction, Request, Response } from "express";
import { permissionService } from "../services/permission.service";
import { AppError } from "../utils/AppError";

export const listPermissions = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await permissionService.listPermissions();
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationIdFromAuth = (req: Request): string => {
  const organizationId = req.authUser?.organization?.id;

  if (!organizationId) {
    throw AppError.forbidden("Organization context is required");
  }

  return organizationId;
};
