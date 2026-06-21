import type { ErrorRequestHandler } from "express";
import type { ApiErrorResponse } from "../types/api-response";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Something went wrong";

  if (!isAppError) {
    console.error(err);
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
