import { createHash, randomBytes } from "node:crypto";

import { env } from "../config/env";
import { parseDurationToMs } from "./duration";

export const generateRefreshToken = (): string => {
  return randomBytes(32).toString("base64url");
};

export const hashRefreshToken = (raw: string): string => {
  return createHash("sha256").update(raw).digest("hex");
};

export const getRefreshTokenExpiresAt = (): Date => {
  const ms = parseDurationToMs(env.refreshTokenExpiresIn);
  return new Date(Date.now() + ms);
};
