import jwt from "jsonwebtoken";
import { env } from "../config/env";

/** Active organization tenant encoded in the access token. */
export type AccessTokenPayload = {
  sub: string;
  orgId: string | null;
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
};
