import { AppError } from "../utils/AppError";

import { flattenAuthUser } from "./authContext";

import type { AuthUser } from "../types/auth";
import type { Request } from "express";


export const requireAuthUser = (req: Request): AuthUser => {
  if (!req.authUser) {
    throw AppError.unauthorized();
  }

  return flattenAuthUser(req.authUser);
};
