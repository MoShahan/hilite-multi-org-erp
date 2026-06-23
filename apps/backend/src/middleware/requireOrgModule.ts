import type { NextFunction, Request, Response } from "express";
import {
  MODULE_DISABLED_MESSAGES,
  type OrgModuleKey,
} from "../constants/orgModules";
import "../types/express";
import { AppError } from "../utils/AppError";

export const requireOrgModule =
  (moduleKey: OrgModuleKey) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(AppError.unauthorized());
      return;
    }

    if (!req.authUser.organization) {
      next(AppError.forbidden("Organization context is required"));
      return;
    }

    if (!req.authUser.modules.includes(moduleKey)) {
      next(
        new AppError(
          403,
          "MODULE_DISABLED",
          MODULE_DISABLED_MESSAGES[moduleKey],
        ),
      );
      return;
    }

    next();
  };
