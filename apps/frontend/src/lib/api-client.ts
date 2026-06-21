import axios, { type AxiosError, type AxiosResponse } from "axios";

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

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;

    if (body?.success === false) {
      return Promise.reject(toApiClientError(body));
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(toApiClientError(error.response?.data));
  },
);

export const unwrapResponse = <T>(
  response: AxiosResponse<ApiSuccessResponse<T>>,
): T => {
  return response.data.data;
};
