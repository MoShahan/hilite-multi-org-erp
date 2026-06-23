import type { NextFunction, Request, Response } from "express";
import { roleService } from "../services/role.service";
import type { CreateRoleInput, UpdateRoleInput } from "../types/role";
import { AppError } from "../utils/AppError";

const getRoleId = (req: Request): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw AppError.badRequest("Role id is required");
  }

  return id;
};

export const listRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await roleService.listRoles(
      req.authUser?.organization?.id ?? null,
      roleService.parseListQuery(req.query as Record<string, unknown>),
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
    const result = await roleService.getRole(
      req.authUser?.organization?.id ?? null,
      getRoleId(req),
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
    );
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
