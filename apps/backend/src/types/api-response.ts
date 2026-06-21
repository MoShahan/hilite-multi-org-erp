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
