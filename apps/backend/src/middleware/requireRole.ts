import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../generated/prisma/client";
import "../types/express";
import { AppError } from "../utils/AppError";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(AppError.unauthorized());
      return;
    }

    if (!roles.includes(req.authUser.user.role)) {
      next(AppError.forbidden("You do not have permission to access this resource"));
      return;
    }

    next();
  };
