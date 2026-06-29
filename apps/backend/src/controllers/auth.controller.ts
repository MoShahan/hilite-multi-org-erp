import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  getAccessTokenMaxAge,
  getRefreshTokenMaxAge,
  refreshTokenCookieOptions,
} from "../config/cookie";
import { buildActorSnapshot } from "../lib/auditHelpers";
import { getAuditRequestContext } from "../lib/auditRequestContext";
import { flattenAuthUser } from "../lib/authContext";
import { resolveSessionOrgId } from "../lib/authSession";
import { verifyAccessToken } from "../lib/jwt";
import { hashRefreshToken } from "../lib/refreshToken";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { auditService } from "../services/audit.service";
import { authService } from "../services/auth.service";
import "../types/express";
import { AppError } from "../utils/AppError";

import type { AuthContext, ChangePasswordInput, UpdateProfileInput } from "../types/auth";
import type { NextFunction, Request, Response } from "express";

const setSessionCookies = (
  res: Response,
  accessToken: string,
  refreshTokenRaw: string,
) => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...accessTokenCookieOptions,
    maxAge: getAccessTokenMaxAge(),
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshTokenRaw, {
    ...refreshTokenCookieOptions,
    maxAge: getRefreshTokenMaxAge(),
  });
};

export const clearSessionCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);
};

const buildAuthAuditMetadata = (context: AuthContext, summary: string) => ({
  summary,
  actor: buildActorSnapshot(flattenAuthUser(context)),
  organization: context.organization
    ? {
        id: context.organization.id,
        name: context.organization.name,
        code: context.organization.code,
      }
    : undefined,
});

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = (req.body as { email?: string }).email?.trim().toLowerCase();
  const password = (req.body as { password?: string }).password;
  const requestContext = getAuditRequestContext(req);

  try {
    if (!email || !password) {
      throw AppError.badRequest("Email and password are required");
    }

    const { accessToken, refreshTokenRaw, context } = await authService.login(
      email,
      password,
      requestContext,
    );

    auditService.log({
      organizationId: context.organization?.id ?? null,
      actorId: context.user.id,
      action: "AUTH_LOGIN_SUCCESS",
      entityType: "auth",
      entityId: context.user.id,
      metadata: {
        ...buildAuthAuditMetadata(context, `Logged in: ${context.user.email}`),
      },
      requestContext,
    });

    setSessionCookies(res, accessToken, refreshTokenRaw);

    return res.json({ message: "Login successful" });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      auditService.log({
        organizationId: null,
        actorId: null,
        action: "AUTH_LOGIN_FAILED",
        entityType: "auth",
        entityId: null,
        metadata: {
          summary: `Failed login attempt: ${email ?? "unknown"}`,
          email,
          reason: error.message,
        },
        requestContext,
      });
    }

    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestContext = getAuditRequestContext(req);
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

  try {
    if (!refreshToken) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token missing");
    }

    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;
    let tokenOrgId: string | null | undefined;

    if (accessToken) {
      try {
        tokenOrgId = verifyAccessToken(accessToken).orgId;
      } catch {
        // Access token expired or invalid.
      }
    }

    const { accessToken: newAccessToken, refreshTokenRaw, context } =
      await authService.refreshSession(
        refreshToken,
        requestContext,
        tokenOrgId,
      );

    auditService.log({
      organizationId: context.organization?.id ?? null,
      actorId: context.user.id,
      action: "AUTH_TOKEN_REFRESHED",
      entityType: "auth",
      entityId: context.user.id,
      metadata: buildAuthAuditMetadata(context, "Session refreshed"),
      requestContext,
    });

    setSessionCookies(res, newAccessToken, refreshTokenRaw);

    return res.json({ message: "Token refreshed" });
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === "REFRESH_TOKEN_REUSE" && refreshToken) {
        const existing = await refreshTokenRepository.findByHash(
          hashRefreshToken(refreshToken),
        );

        if (existing) {
          const orgId = resolveSessionOrgId(existing.user);
          const context = await authService.resolveAuthContext(
            existing.user.id,
            orgId,
          );

          auditService.log({
            organizationId: context.organization?.id ?? null,
            actorId: context.user.id,
            action: "AUTH_SESSION_REVOKED",
            entityType: "auth",
            entityId: context.user.id,
            metadata: buildAuthAuditMetadata(
              context,
              "Session revoked due to refresh token reuse",
            ),
            requestContext,
          });
        }
      } else if (error.code === "REFRESH_TOKEN_INVALID") {
        auditService.log({
          organizationId: null,
          actorId: null,
          action: "AUTH_TOKEN_REFRESH_FAILED",
          entityType: "auth",
          entityId: null,
          metadata: {
            summary: "Failed token refresh",
            reason: error.message,
          },
          requestContext,
        });
      }
    }

    next(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.authUser) {
    throw AppError.unauthorized();
  }

  const me = await authService.getMe(
    req.authUser.user.id,
    req.authUser.organization?.id ?? null,
  );

  return res.json(me);
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestContext = getAuditRequestContext(req);

  try {
    if (!req.authUser) {
      throw AppError.unauthorized();
    }

    const previousName = req.authUser.user.name;
    const previousPhoneNumber = req.authUser.user.phoneNumber;
    const me = await authService.updateProfile(
      req.authUser.user.id,
      req.authUser.organization?.id ?? null,
      req.body as UpdateProfileInput,
    );

    const changedFields: string[] = [];

    if (me.user.name !== previousName) {
      changedFields.push("name");
    }

    if (me.user.phoneNumber !== previousPhoneNumber) {
      changedFields.push("phoneNumber");
    }

    if (changedFields.length > 0) {
      auditService.log({
        organizationId: me.organization?.id ?? null,
        actorId: me.user.id,
        action: "AUTH_PROFILE_UPDATED",
        entityType: "auth",
        entityId: me.user.id,
        metadata: {
          ...buildAuthAuditMetadata(
            req.authUser,
            `Profile updated: ${me.user.name}`,
          ),
          before: {
            name: previousName,
            phoneNumber: previousPhoneNumber,
          },
          after: {
            name: me.user.name,
            phoneNumber: me.user.phoneNumber,
          },
          changedFields,
        },
        requestContext,
      });
    }

    return res.json(me);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestContext = getAuditRequestContext(req);

  try {
    if (!req.authUser) {
      throw AppError.unauthorized();
    }

    const result = await authService.changePassword(
      req.authUser.user.id,
      req.body as ChangePasswordInput,
    );

    auditService.log({
      organizationId: req.authUser.organization?.id ?? null,
      actorId: req.authUser.user.id,
      action: "AUTH_PASSWORD_CHANGED",
      entityType: "auth",
      entityId: req.authUser.user.id,
          metadata: buildAuthAuditMetadata(
            {
              user: flattenAuthUser(req.authUser),
              organization: req.authUser.organization,
              membership: req.authUser.membership,
              modules: req.authUser.modules,
            },
            "Password changed",
          ),
      requestContext,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  const requestContext = getAuditRequestContext(req);
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;
  let context: AuthContext | null = null;

  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;

  try {
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        context = await authService.resolveAuthContext(
          payload.sub,
          payload.orgId,
        );
      } catch {
        // Access token expired or invalid.
      }
    }

    if (refreshToken) {
      if (!context) {
        const user = await authService.revokeSession(refreshToken);

        if (user) {
          const orgId = resolveSessionOrgId(user);
          context = await authService.resolveAuthContext(user.id, orgId);
        }
      } else {
        await authService.revokeSession(refreshToken);
      }
    }

    if (context) {
      auditService.log({
        organizationId: context.organization?.id ?? null,
        actorId: context.user.id,
        action: "AUTH_LOGOUT",
        entityType: "auth",
        entityId: context.user.id,
        metadata: buildAuthAuditMetadata(
          context,
          `Logged out: ${context.user.email}`,
        ),
        requestContext,
      });
    }
  } finally {
    clearSessionCookies(res);
  }

  return res.json({ message: "Logout successful" });
};
