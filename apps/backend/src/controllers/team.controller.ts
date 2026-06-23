import type { NextFunction, Request, Response } from "express";
import { teamService } from "../services/team.service";
import type { CreateTeamInput, CreateTeamMemberInput } from "../types/team";

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const listTeams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await teamService.listTeams(
      req.authUser?.organization?.id ?? null,
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await teamService.createTeam(
      req.authUser?.organization?.id ?? null,
      req.body as CreateTeamInput,
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await teamService.getTeam(
      req.authUser?.organization?.id ?? null,
      getRouteId(req),
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await teamService.listMembers(
      req.authUser?.organization?.id ?? null,
      getRouteId(req),
      req.query as Record<string, unknown>,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await teamService.createMember(
      req.authUser?.organization?.id ?? null,
      getRouteId(req),
      req.body as CreateTeamMemberInput,
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
