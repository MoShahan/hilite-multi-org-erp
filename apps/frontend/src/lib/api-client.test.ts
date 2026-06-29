import { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { unwrapResponse } from "./api-client";

type InterceptorHandler = (response: AxiosResponse) => unknown;
type ErrorHandler = (error: AxiosError) => Promise<unknown>;

const { mockInstance, mockPost, mockUse } = vi.hoisted(() => {
  const mockInstance = vi.fn(
    async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
      config,
      status: 200,
      data: { success: true, message: "ok", data: {} },
      statusText: "OK",
      headers: {},
    }),
  );
  const mockPost = vi.fn();
  const mockUse = vi.fn();

  return { mockInstance, mockPost, mockUse };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() =>
      Object.assign(mockInstance, {
        post: mockPost,
        interceptors: {
          response: {
            use: mockUse,
          },
        },
        defaults: {},
      }),
    ),
  },
}));

const getSuccessHandler = (): InterceptorHandler => {
  const call = mockUse.mock.calls[mockUse.mock.calls.length - 1];
  if (!call) {
    throw new Error("Response interceptor was not registered");
  }

  return call[0] as InterceptorHandler;
};

const getErrorHandler = (): ErrorHandler => {
  const call = mockUse.mock.calls[mockUse.mock.calls.length - 1];
  if (!call) {
    throw new Error("Response interceptor was not registered");
  }

  return call[1] as ErrorHandler;
};

const makeAxiosError = (
  partial: Pick<AxiosError, "response" | "config">,
): AxiosError => partial as AxiosError;

describe("unwrapResponse", () => {
  it("returns nested data from a success response", () => {
    const response = {
      data: {
        success: true,
        message: "ok",
        data: { id: "lead-1" },
      },
    } as AxiosResponse;

    expect(unwrapResponse(response)).toEqual({ id: "lead-1" });
  });
});

describe("api-client response handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("rejects success:false response bodies", async () => {
    await import("./api-client");
    const successHandler = getSuccessHandler();

    await expect(
      successHandler({
        data: {
          success: false,
          message: "Validation failed",
          data: { code: "VALIDATION_ERROR" },
        },
      } as AxiosResponse),
    ).rejects.toMatchObject({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
    });
  });

  it("propagates non-401 errors without refresh", async () => {
    await import("./api-client");
    const errorHandler = getErrorHandler();

    await expect(
      errorHandler(
        makeAxiosError({
          response: {
            status: 403,
            data: {
              success: false,
              message: "Forbidden",
              data: { code: "FORBIDDEN" },
            },
          } as AxiosError["response"],
          config: { url: "/api/v1/leads" } as unknown as InternalAxiosRequestConfig,
        }),
      ),
    ).rejects.toMatchObject({ message: "Forbidden", code: "FORBIDDEN" });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("queues concurrent 401 requests behind a single refresh", async () => {
    await import("./api-client");
    const errorHandler = getErrorHandler();

    let resolveRefresh: (() => void) | undefined;
    mockPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = () =>
            resolve({
              status: 200,
              data: { success: true, message: "Token refreshed" },
            } as AxiosResponse);
        }),
    );

    const makeLead401 = () =>
      errorHandler(
        makeAxiosError({
          response: {
            status: 401,
            data: { success: false, message: "Unauthorized", data: null },
          } as AxiosError["response"],
          config: { url: "/api/v1/leads" } as unknown as InternalAxiosRequestConfig,
        }),
      );

    const first = makeLead401();
    const second = makeLead401();

    expect(mockPost).toHaveBeenCalledTimes(1);

    resolveRefresh?.();

    await expect(first).resolves.toMatchObject({ status: 200 });
    await expect(second).resolves.toMatchObject({ status: 200 });
  });

  it("does not refresh logout endpoint", async () => {
    await import("./api-client");
    const errorHandler = getErrorHandler();

    await expect(
      errorHandler(
        makeAxiosError({
          response: {
            status: 401,
            data: { success: false, message: "Unauthorized", data: null },
          } as AxiosError["response"],
          config: { url: "/api/v1/auth/logout" } as unknown as InternalAxiosRequestConfig,
        }),
      ),
    ).rejects.toMatchObject({ message: "Unauthorized" });

    expect(mockPost).not.toHaveBeenCalled();
  });
});
