export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "TOKEN_EXPIRED"
  | "TWO_FACTOR_REQUIRED"
  | "FORBIDDEN"
  | "TENANT_REQUIRED"
  | "TENANT_FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "EXPORT_FAILED"
  | "UPLOAD_REJECTED"
  | "INTERNAL_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

export type ApiFailure = {
  success: false;
  error: ApiError;
  meta: {
    requestId: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginatedResponse<T> = ApiSuccess<T[]> & {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

