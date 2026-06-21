import type { CookieOptions } from "express";
import { env } from "./env";

export const ACCESS_TOKEN_COOKIE = "access_token";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "none",
  path: "/",
};

export const getAccessTokenMaxAge = (): number => {
  const expiresIn = env.jwtExpiresIn;

  if (expiresIn.endsWith("d")) {
    return Number(expiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000;
  }

  if (expiresIn.endsWith("h")) {
    return Number(expiresIn.slice(0, -1)) * 60 * 60 * 1000;
  }

  if (expiresIn.endsWith("m")) {
    return Number(expiresIn.slice(0, -1)) * 60 * 1000;
  }

  return 24 * 60 * 60 * 1000;
};
