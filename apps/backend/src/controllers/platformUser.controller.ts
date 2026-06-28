import type { NextFunction, Request, Response } from "express";
import { requireAuthUser } from "../lib/requireAuthUser";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import { platformUserService } from "../services/platformUser.service";
import type { CreatePlatformUserInput, UpdatePlatformUserStatusInput } from "../types/platformUser";

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const getAuditContext = (req: Request) => ({
  authUser: requireAuthUser(req),
  requestContext: getAuditRequestContext(req),
});

export const listPlatformUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await platformUserService.listPlatformUsers(
      requireAuthUser(req),
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createPlatformUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await platformUserService.createPlatformUser(
      requireAuthUser(req),
      req.body as CreatePlatformUserInput,
      getAuditContext(req),
    );
    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updatePlatformUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await platformUserService.updatePlatformUserStatus(
      requireAuthUser(req),
      getRouteId(req),
      req.body as UpdatePlatformUserStatusInput,
      getAuditContext(req),
    );
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};
