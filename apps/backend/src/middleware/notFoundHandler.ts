import type { ApiErrorResponse } from "../types/api-response";
import type { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorResponse = {
    success: false,
    message: "Route not found",
    data: { code: "NOT_FOUND" },
  };

  res.status(404).json(body);
};
