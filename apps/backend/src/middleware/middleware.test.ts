import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("../lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { PERMISSIONS } from "../constants/permissions";
import { ORG_MODULE_KEYS } from "../constants/orgModules";
import { errorHandler } from "./errorHandler";
import { requireAnyPermission } from "./requireAnyPermission";
import { requireOrgModule } from "./requireOrgModule";
import { requirePermission } from "./requirePermission";
import { validateBody } from "./validateBody";
import { AppError } from "../utils/AppError";
import {
  baseAuthContext,
  mockNext,
  mockReq,
  mockRes,
} from "../test/helpers";

describe("requirePermission", () => {
  it("returns unauthorized when auth context is missing", () => {
    const next = mockNext();
    requirePermission(PERMISSIONS.USERS_READ)(mockReq(), mockRes().res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect((next.mock.calls[0]![0] as AppError).statusCode).toBe(401);
  });

  it("returns forbidden when permission is missing", () => {
    const next = mockNext();
    requirePermission(PERMISSIONS.USERS_READ)(
      mockReq({ authUser: baseAuthContext() }),
      mockRes().res,
      next,
    );

    expect((next.mock.calls[0]![0] as AppError).statusCode).toBe(403);
  });

  it("calls next when all permissions are present", () => {
    const next = mockNext();
    requirePermission(PERMISSIONS.USERS_READ)(
      mockReq({
        authUser: baseAuthContext({
          membership: {
            role: { id: "role-1", name: "Admin", slug: "org_admin" },
            permissions: [PERMISSIONS.USERS_READ],
            team: null,
          },
        }),
      }),
      mockRes().res,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});

describe("requireAnyPermission", () => {
  it("allows access when any permission matches", () => {
    const next = mockNext();
    requireAnyPermission(PERMISSIONS.USERS_READ, PERMISSIONS.USERS_READ_TEAM)(
      mockReq({
        authUser: baseAuthContext({
          membership: {
            role: { id: "role-1", name: "Lead", slug: "team_lead" },
            permissions: [PERMISSIONS.USERS_READ_TEAM],
            team: { id: "team-a", name: "Team A" },
          },
        }),
      }),
      mockRes().res,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("forbids access when no permissions match", () => {
    const next = mockNext();
    requireAnyPermission(PERMISSIONS.USERS_READ, PERMISSIONS.USERS_READ_TEAM)(
      mockReq({ authUser: baseAuthContext() }),
      mockRes().res,
      next,
    );

    expect((next.mock.calls[0]![0] as AppError).statusCode).toBe(403);
  });
});

describe("requireOrgModule", () => {
  it("requires organization context", () => {
    const next = mockNext();
    requireOrgModule(ORG_MODULE_KEYS.SALES_ERP)(
      mockReq({
        authUser: baseAuthContext({ organization: null }),
      }),
      mockRes().res,
      next,
    );

    expect((next.mock.calls[0]![0] as AppError).statusCode).toBe(403);
  });

  it("forbids disabled modules", () => {
    const next = mockNext();
    requireOrgModule(ORG_MODULE_KEYS.SALES_ERP)(
      mockReq({ authUser: baseAuthContext({ modules: [] }) }),
      mockRes().res,
      next,
    );

    expect((next.mock.calls[0]![0] as AppError).code).toBe("MODULE_DISABLED");
  });

  it("allows enabled modules", () => {
    const next = mockNext();
    requireOrgModule(ORG_MODULE_KEYS.SALES_ERP)(
      mockReq({
        authUser: baseAuthContext({ modules: [ORG_MODULE_KEYS.SALES_ERP] }),
      }),
      mockRes().res,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});

describe("validateBody", () => {
  const schema = z.object({
    name: z.string().min(1),
  });

  it("parses valid body and calls next", () => {
    const next = mockNext();
    const req = mockReq({ body: { name: "Alice" } });

    validateBody(schema)(req, mockRes().res, next);

    expect(req.body).toEqual({ name: "Alice" });
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards validation errors", () => {
    const next = mockNext();

    validateBody(schema)(mockReq({ body: { name: "" } }), mockRes().res, next);

    const error = next.mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.details?.[0]?.field).toBe("name");
  });
});

describe("errorHandler", () => {
  it("returns app error status and payload", () => {
    const { res, status, json } = mockRes();
    const error = AppError.forbidden("Not allowed");

    errorHandler(
      error,
      mockReq({ path: "/api/test", method: "GET" }),
      res,
      mockNext(),
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Not allowed",
      data: { code: "FORBIDDEN", details: undefined },
    });
  });

  it("returns 500 for unknown errors", () => {
    const { res, status, json } = mockRes();

    errorHandler(
      new Error("boom"),
      mockReq({ path: "/api/test", method: "POST" }),
      res,
      mockNext(),
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  });
});
