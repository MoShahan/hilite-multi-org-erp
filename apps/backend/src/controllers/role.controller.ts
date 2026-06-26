import type { NextFunction, Request, Response } from "express";
import { roleService } from "../services/role.service";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import type { CreateRoleInput, UpdateRoleInput } from "../types/role";
import { AppError } from "../utils/AppError";

const getRoleId = (req: Request): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw AppError.badRequest("Role id is required");
  }

  return id;
};

const getAuditContext = (req: Request) => {
  if (!req.authUser) {
    throw new Error("Auth context is required");
  }

  return {
    authUser: req.authUser.user,
    requestContext: getAuditRequestContext(req),
  };
};

export const listRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.authUser) {
      throw new Error("Auth context is required");
    }

    const result = await roleService.listRoles(
      req.authUser.organization?.id ?? null,
      roleService.parseListQuery(req.query as Record<string, unknown>),
      req.authUser.user,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.authUser) {
      throw new Error("Auth context is required");
    }

    const result = await roleService.getRole(
      req.authUser.organization?.id ?? null,
      getRoleId(req),
      req.authUser.user,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await roleService.createRole(
      req.authUser?.organization?.id ?? null,
      req.body as CreateRoleInput,
      getAuditContext(req),
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await roleService.updateRole(
      req.authUser?.organization?.id ?? null,
      getRoleId(req),
      req.body as UpdateRoleInput,
      getAuditContext(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await roleService.deleteRole(
      req.authUser?.organization?.id ?? null,
      getRoleId(req),
      getAuditContext(req),
    );
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
