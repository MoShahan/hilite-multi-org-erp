import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { AppError } from "../utils/AppError";

const toValidationDetails = (error: {
  issues: { path: PropertyKey[]; message: string }[];
}) =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || undefined,
    message: issue.message,
  }));

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        AppError.badRequest("Validation failed", toValidationDetails(result.error)),
      );
      return;
    }

    req.body = result.data;
    next();
  };
