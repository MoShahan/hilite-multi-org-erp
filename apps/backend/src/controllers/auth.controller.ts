import type { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  getAccessTokenMaxAge,
} from "../config/cookie";
import { authService } from "../services/auth.service";
import "../types/express";
import { AppError } from "../utils/AppError";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password) {
      throw AppError.badRequest("Email and password are required");
    }

    const { token } = await authService.login(email, password);

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...accessTokenCookieOptions,
      maxAge: getAccessTokenMaxAge(),
    });

    return res.json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.authUser) {
    throw AppError.unauthorized();
  }

  const me = await authService.getMe(req.authUser.user.id);

  return res.json(me);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  return res.json({ message: "Logout successful" });
};
