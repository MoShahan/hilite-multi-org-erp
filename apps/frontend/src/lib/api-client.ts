import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiErrorData = {
  code: string;
  details?: ApiErrorDetail[];
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: ApiErrorData | null;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const toApiClientError = (body?: ApiErrorResponse): ApiClientError => {
  return new ApiClientError(
    body?.message ?? "An unexpected error occurred",
    body?.data?.code,
    body?.data?.details,
  );
};

const AUTH_PATHS_SKIP_REFRESH = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
];

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) {
    return true;
  }

  return AUTH_PATHS_SKIP_REFRESH.some((path) => url.includes(path));
};

let isRefreshing = false;
let refreshWaitQueue: Array<{
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
  reject: (reason?: unknown) => void;
  config: RetryableRequestConfig;
}> = [];

const flushRefreshQueue = (error?: unknown) => {
  const queue = refreshWaitQueue;
  refreshWaitQueue = [];

  for (const pending of queue) {
    if (error) {
      pending.reject(error);
      continue;
    }

    void apiClient(pending.config).then(pending.resolve).catch(pending.reject);
  }
};

const refreshSession = async () => {
  await apiClient.post("/api/v1/auth/refresh");
};

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;

    if (body?.success === false) {
      return Promise.reject(toApiClientError(body));
    }

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          refreshWaitQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshSession();
        isRefreshing = false;
        flushRefreshQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        const apiError = toApiClientError(
          (refreshError as AxiosError<ApiErrorResponse>).response?.data ??
            error.response?.data,
        );
        flushRefreshQueue(apiError);
        return Promise.reject(apiError);
      }
    }

    return Promise.reject(toApiClientError(error.response?.data));
  },
);

export const unwrapResponse = <T>(
  response: AxiosResponse<ApiSuccessResponse<T>>,
): T => {
  return response.data.data;
};
