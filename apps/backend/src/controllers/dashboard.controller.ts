import type { NextFunction, Request, Response } from "express";
import type { DashboardLayoutUpdateInput } from "@hilite/shared";
import { dashboardService } from "../services/dashboard.service";
import { dashboardLayoutService } from "../services/dashboardLayout.service";
import { requireAuthUser } from "../lib/requireAuthUser";

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await dashboardService.getSummary(
      req.authUser?.organization?.id ?? null,
      requireAuthUser(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getDashboardLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await dashboardLayoutService.getLayout(requireAuthUser(req));
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgets } = req.body as DashboardLayoutUpdateInput;
    const result = await dashboardLayoutService.updateLayout(
      requireAuthUser(req),
      widgets,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resetDashboardLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await dashboardLayoutService.resetLayout(requireAuthUser(req));
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
