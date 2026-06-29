import { logger } from "../lib/logger";
import { AppError } from "../utils/AppError";

import type { ApiErrorResponse } from "../types/api-response";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Something went wrong";

  const context = {
    path: req.path,
    method: req.method,
    userId: req.authUser?.user.id,
    organizationId: req.authUser?.organization?.id,
  };

  if (isAppError) {
    if (statusCode >= 500) {
      logger.error(message, {
        ...context,
        code: err.code,
        statusCode,
      });
    }
  } else {
    logger.error("Unhandled error", {
      ...context,
      err,
    });
  }

  const body: ApiErrorResponse = {
    success: false,
    message,
    data: isAppError
      ? { code: err.code, details: err.details }
      : null,
  };

  res.status(statusCode).json(body);
};
