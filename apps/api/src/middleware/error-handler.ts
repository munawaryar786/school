import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { fail } from "../http/responses";
import { prisma } from "../db/prisma";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return fail(res, 400, "VALIDATION_ERROR", "Validation failed.", error.flatten());
  }

  if (error instanceof Error && typeof (error as any).statusCode === "number") {
    const status = (error as any).statusCode;
    return fail(res, status, status === 404 ? "NOT_FOUND" : status === 403 ? "FORBIDDEN" : "VALIDATION_ERROR", error.message);
  }

  console.error(error);
  void prisma.errorMonitoringEvent.create({
    data: {
      schoolId: _req.auth?.schoolId ?? null,
      source: `${_req.method} ${_req.originalUrl}`,
      severity: "ERROR",
      message: error instanceof Error ? error.message : "Unexpected server error.",
      stack: error instanceof Error ? error.stack : undefined,
      status: "OPEN"
    }
  }).catch(() => undefined);
  return fail(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
}
