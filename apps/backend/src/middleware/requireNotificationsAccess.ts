import type { NextFunction, Request, Response } from "express";
import {
  MODULE_DISABLED_MESSAGES,
  ORG_MODULE_KEYS,
} from "../constants/orgModules";
import "../types/express";
import { AppError } from "../utils/AppError";

export const requireNotificationsAccess = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.authUser) {
    next(AppError.unauthorized());
    return;
  }

  if (!req.authUser.organization) {
    next();
    return;
  }

  if (!req.authUser.modules.includes(ORG_MODULE_KEYS.NOTIFICATIONS)) {
    next(
      new AppError(
        403,
        "MODULE_DISABLED",
        MODULE_DISABLED_MESSAGES[ORG_MODULE_KEYS.NOTIFICATIONS],
      ),
    );
    return;
  }

  next();
};
