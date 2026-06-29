import type { Request } from "express";
import { flattenAuthUser } from "./authContext";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";

export const requireAuthUser = (req: Request): AuthUser => {
  if (!req.authUser) {
    throw AppError.unauthorized();
  }

  return flattenAuthUser(req.authUser);
};
