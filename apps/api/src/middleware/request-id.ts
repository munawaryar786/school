import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  res.locals.requestId = incoming || `req_${crypto.randomUUID()}`;
  res.setHeader("x-request-id", res.locals.requestId);
  next();
}

