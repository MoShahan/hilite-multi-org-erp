import type { NextFunction, Request, Response } from "express";
import { orgUserService } from "../services/user.service";
import { requireAuthUser } from "../lib/requireAuthUser";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import type { CreateUserInput, UpdateUserStatusInput } from "../types/user";

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const getAuditContext = (req: Request) => ({
  authUser: requireAuthUser(req),
  requestContext: getAuditRequestContext(req),
});

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await orgUserService.listUsers(
      req.authUser?.organization?.id ?? null,
      req.authUser!.user,
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await orgUserService.createUser(
      req.authUser?.organization?.id ?? null,
      req.body as CreateUserInput,
      getAuditContext(req),
    );
    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await orgUserService.updateUserStatus(
      req.authUser?.organization?.id ?? null,
      req.authUser?.user.id ?? "",
      getRouteId(req),
      req.body as UpdateUserStatusInput,
      getAuditContext(req),
    );
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};
