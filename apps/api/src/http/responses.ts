import type { Response } from "express";
import type { ApiErrorCode } from "@school-erp/shared";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId
    }
  });
}

export function fail(res: Response, status: number, code: ApiErrorCode, message: string, details?: unknown) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      requestId: res.locals.requestId
    }
  });
}

