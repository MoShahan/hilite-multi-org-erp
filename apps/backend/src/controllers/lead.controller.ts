import type { NextFunction, Request, Response } from "express";
import { activityService } from "../services/activity.service";
import { leadService } from "../services/lead.service";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import type { AssignLeadInput, CreateLeadInput, UpdateLeadInput } from "../types/lead";
import type { CreateActivityInput } from "../types/activity";

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const getAuthUser = (req: Request) => {
  if (!req.authUser) {
    throw new Error("Auth context is required");
  }

  return req.authUser.user;
};

const getAuditContext = (req: Request) => ({
  authUser: getAuthUser(req),
  requestContext: getAuditRequestContext(req),
});

export const listLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.listLeads(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.getLead(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.createLead(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      req.body as CreateLeadInput,
      getAuditContext(req),
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.updateLead(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
      req.body as UpdateLeadInput,
      getAuditContext(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const assignLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.assignLead(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
      req.body as AssignLeadInput,
      getAuditContext(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await activityService.listActivities(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listStatusHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await leadService.listStatusHistory(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await activityService.createActivity(
      req.authUser?.organization?.id ?? null,
      getAuthUser(req),
      getRouteId(req),
      req.body as CreateActivityInput,
      getAuditContext(req),
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
