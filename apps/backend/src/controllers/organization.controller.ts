import type { NextFunction, Request, Response } from "express";
import { organizationModuleService } from "../services/organizationModule.service";
import { organizationService } from "../services/organization.service";
import { requireAuthUser } from "../lib/requireAuthUser";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
} from "../types/organization";
import type { UpdateOrgModulesInput } from "../types/organizationModule";
import { AppError } from "../utils/AppError";

const getAuditContext = (req: Request) => ({
  authUser: requireAuthUser(req),
  requestContext: getAuditRequestContext(req),
});

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
      getAuditContext(req),
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
      getAuditContext(req),
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
      getAuditContext(req),
    );
    return res.json({ organization });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationModules = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = getOrganizationId(req);
    await organizationService.getOrganization(organizationId);
    const result =
      await organizationModuleService.getModulesResponse(organizationId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationModules = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = getOrganizationId(req);
    await organizationService.getOrganization(organizationId);

    const body = req.body as UpdateOrgModulesInput;

    if (!body?.modules || typeof body.modules !== "object") {
      throw AppError.badRequest("modules object is required", [
        { field: "modules", message: "modules object is required" },
      ]);
    }

    const result = await organizationModuleService.updateModules(
      organizationId,
      body,
      getAuditContext(req),
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
};
