import { getMembershipPermissions } from "../lib/authContext";
import "../types/express";
import { AppError } from "../utils/AppError";

import type { NextFunction, Request, Response } from "express";

export const requireAnyPermission =
  (...permissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(AppError.unauthorized());
      return;
    }

    const userPermissions = getMembershipPermissions(req.authUser);
    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      next(AppError.forbidden("You do not have permission to access this resource"));
      return;
    }

    next();
  };
