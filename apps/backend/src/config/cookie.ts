import { parseDurationToMs } from "../lib/duration";

import { env } from "./env";

import type { CookieOptions } from "express";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "none",
  path: "/",
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "none",
  path: "/",
};

export const getAccessTokenMaxAge = (): number => {
  return parseDurationToMs(env.jwtExpiresIn);
};

export const getRefreshTokenMaxAge = (): number => {
  return parseDurationToMs(env.refreshTokenExpiresIn);
};
