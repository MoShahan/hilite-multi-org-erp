import type { NextFunction, Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { dashboardLayoutService } from "../services/dashboardLayout.service";
import type { DashboardLayoutItem } from "../constants/dashboardWidgets";
import { AppError } from "../utils/AppError";

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

export const getDashboardLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await dashboardLayoutService.getLayout(getAuthUser(req));
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const parseLayoutWidgets = (body: unknown): DashboardLayoutItem[] => {
  if (
    typeof body !== "object" ||
    body === null ||
    !("widgets" in body) ||
    !Array.isArray(body.widgets)
  ) {
    throw AppError.badRequest("Invalid layout payload", [
      { field: "widgets", message: "Widgets array is required" },
    ]);
  }

  return body.widgets.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.key !== "string" ||
      typeof item.visible !== "boolean"
    ) {
      throw AppError.badRequest("Invalid widget item", [
        {
          field: `widgets[${index}]`,
          message: "Each widget requires key and visible",
        },
      ]);
    }

    return {
      key: item.key as DashboardLayoutItem["key"],
      order:
        typeof item.order === "number" ? item.order : index,
      visible: item.visible,
    };
  });
};

export const updateDashboardLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const widgets = parseLayoutWidgets(req.body);
    const result = await dashboardLayoutService.updateLayout(
      getAuthUser(req),
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
    const result = await dashboardLayoutService.resetLayout(getAuthUser(req));
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
