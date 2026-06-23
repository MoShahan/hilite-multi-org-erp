import type { NextFunction, Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

const getAuthUser = (req: Request) => {
  if (!req.authUser) {
    throw new Error("Auth context is required");
  }

  return req.authUser.user;
};

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await dashboardService.getSummary(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
