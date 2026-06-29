import { ACCESS_TOKEN_COOKIE } from "../config/cookie";
import { verifyAccessToken } from "../lib/jwt";
import { authService } from "../services/auth.service";
import "../types/express";
import { AppError } from "../utils/AppError";

import type { NextFunction, Request, Response } from "express";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw AppError.unauthorized();
    }

    const payload = verifyAccessToken(token);
    req.authUser = await authService.resolveAuthContext(
      payload.sub,
      payload.orgId,
    );
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(AppError.unauthorized());
  }
};
