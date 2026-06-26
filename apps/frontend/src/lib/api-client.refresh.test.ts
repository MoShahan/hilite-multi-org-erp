import { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

type InterceptorHandler = (error: AxiosError) => Promise<unknown>;

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

const getErrorHandler = (): InterceptorHandler => {
  const calls = mockUse.mock.calls;
  const call = calls[calls.length - 1];
  if (!call) {
    throw new Error("Response interceptor was not registered");
  }

  return call[1] as InterceptorHandler;
};

const makeAxiosError = (
  partial: Pick<AxiosError, "response" | "config">,
): AxiosError => partial as AxiosError;

describe("api-client refresh interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("retries the original request after a successful refresh", async () => {
    const { apiClient } = await import("./api-client");
    const errorHandler = getErrorHandler();
    const originalConfig = {
      url: "/api/v1/leads",
      _retry: false,
    } as unknown as InternalAxiosRequestConfig;

    mockPost.mockResolvedValueOnce({
      status: 200,
      data: { success: true, message: "Token refreshed" },
    } as AxiosResponse);

    const result = (await errorHandler(
      makeAxiosError({
        response: {
          status: 401,
          data: { success: false, message: "Unauthorized", data: null },
        } as AxiosError["response"],
        config: originalConfig,
      }),
    )) as AxiosResponse;

    expect(mockPost).toHaveBeenCalledWith("/api/v1/auth/refresh");
    expect(apiClient).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/v1/leads", _retry: true }),
    );
    expect(result.status).toBe(200);
  });

  it("rejects when refresh fails", async () => {
    await import("./api-client");
    const errorHandler = getErrorHandler();

    mockPost.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          success: false,
          message: "Refresh token expired",
          data: { code: "REFRESH_TOKEN_INVALID" },
        },
      },
    });

    await expect(
      errorHandler(
        makeAxiosError({
          response: {
            status: 401,
            data: { success: false, message: "Unauthorized", data: null },
          } as AxiosError["response"],
          config: { url: "/api/v1/leads" } as unknown as InternalAxiosRequestConfig,
        }),
      ),
    ).rejects.toMatchObject({
      message: "Refresh token expired",
      code: "REFRESH_TOKEN_INVALID",
    });
  });

  it("does not refresh auth endpoints", async () => {
    await import("./api-client");
    const errorHandler = getErrorHandler();

    await expect(
      errorHandler(
        makeAxiosError({
          response: {
            status: 401,
            data: { success: false, message: "Unauthorized", data: null },
          } as AxiosError["response"],
          config: { url: "/api/v1/auth/login" } as unknown as InternalAxiosRequestConfig,
        }),
      ),
    ).rejects.toMatchObject({ message: "Unauthorized" });

    expect(mockPost).not.toHaveBeenCalled();
  });
});
