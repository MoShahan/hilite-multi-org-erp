import type { NextFunction, Request, Response } from "express";
import { expect, vi, type Mock } from "vitest";

import { OrganizationStatus } from "../generated/prisma/client";
import type { AuthContext, AuthUser } from "../types/auth";
import { AppError } from "../utils/AppError";

export const baseAuthUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  phoneNumber: null,
  status: "ACTIVE",
  role: { id: "role-1", name: "Team Lead", slug: "team_lead" },
  permissions: [],
  team: { id: "team-a", name: "Team A" },
  ...overrides,
});

export const baseAuthContext = (
  overrides?: Partial<AuthContext>,
): AuthContext => {
  const user = baseAuthUser();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      status: user.status,
    },
    organization: {
      id: "org-1",
      name: "Test Org",
      code: "TEST",
      status: OrganizationStatus.ACTIVE,
    },
    membership: {
      role: user.role!,
      permissions: user.permissions,
      team: user.team,
    },
    modules: [],
    ...overrides,
  };
};

export const expectAppError = (
  fn: () => unknown,
  statusCode: number,
  code?: string,
) => {
  try {
    fn();
    expect.fail("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(statusCode);
    if (code !== undefined) {
      expect((error as AppError).code).toBe(code);
    }
  }
};

export const expectAppErrorAsync = async (
  fn: () => Promise<unknown>,
  statusCode: number,
  code?: string,
) => {
  try {
    await fn();
    expect.fail("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(statusCode);
    if (code !== undefined) {
      expect((error as AppError).code).toBe(code);
    }
  }
};

export const mockReq = (overrides?: Partial<Request>): Request =>
  ({ ...overrides }) as Request;

export const mockRes = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;

  return { res, json, status };
};

export const mockNext = (): Mock<NextFunction> => vi.fn();
