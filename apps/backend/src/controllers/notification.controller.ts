import { notificationService } from "../services/notification.service";

import type { NextFunction, Request, Response } from "express";

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const listNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.listNotifications(
      req.authUser?.user.id ?? "",
      req.authUser?.organization?.id ?? null,
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.getUnreadCount(
      req.authUser?.user.id ?? "",
      req.authUser?.organization?.id ?? null,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notification = await notificationService.markRead(
      req.authUser?.user.id ?? "",
      req.authUser?.organization?.id ?? null,
      getRouteId(req),
    );
    return res.json({ notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.markAllRead(
      req.authUser?.user.id ?? "",
      req.authUser?.organization?.id ?? null,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
