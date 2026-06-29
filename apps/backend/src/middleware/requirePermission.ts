import type { NextFunction, Request, Response } from "express";
import { getMembershipPermissions } from "../lib/authContext";
import "../types/express";
import { AppError } from "../utils/AppError";

export const requirePermission =
  (...permissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(AppError.unauthorized());
      return;
    }

    const userPermissions = getMembershipPermissions(req.authUser);
    const hasPermission = permissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      next(AppError.forbidden("You do not have permission to access this resource"));
      return;
    }

    next();
  };
