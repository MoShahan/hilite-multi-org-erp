import type { NextFunction, Request, Response } from "express";
import { organizationService } from "../services/organization.service";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
} from "../types/organization";
import { AppError } from "../utils/AppError";

export const listOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await organizationService.listOrganizations(req.query);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOrganizationId = (req: Request): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw AppError.badRequest("Organization id is required");
  }

  return id;
};

export const getOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization = await organizationService.getOrganization(
      getOrganizationId(req),
    );
    return res.json({ organization });
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization = await organizationService.createOrganization(
      req.body as CreateOrganizationInput,
    );
    return res.status(201).json({ organization });
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization = await organizationService.updateOrganization(
      getOrganizationId(req),
      req.body as UpdateOrganizationInput,
    );
    return res.json({ organization });
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization = await organizationService.updateOrganizationStatus(
      getOrganizationId(req),
      req.body as UpdateOrganizationStatusInput,
    );
    return res.json({ organization });
  } catch (error) {
    next(error);
  }
};
