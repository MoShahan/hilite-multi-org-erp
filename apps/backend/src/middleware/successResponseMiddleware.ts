import type { ApiSuccessResponse } from "../types/api-response";
import type { RequestHandler, Response } from "express";

const isFormattedResponse = (body: unknown): boolean => {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    typeof (body as { success: unknown }).success === "boolean"
  );
};

export const successResponseMiddleware: RequestHandler = (_req, res, next) => {
  const response = res as Response & {
    json: Response["json"];
  };
  const originalJson = response.json.bind(response);

  response.json = (body: unknown) => {
    if (isFormattedResponse(body)) {
      return originalJson(body);
    }

    const envelope: ApiSuccessResponse<unknown> = {
      success: true,
      message: "",
      data: body,
    };

    return originalJson(envelope);
  };

  next();
};
