import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { roleSchema, type Permission } from "@school-erp/shared";
import { fail } from "../../http/responses";
import { env } from "../../config/env";

export type AuthContext = {
  userId: string;
  role: string;
  schoolId: string | null;
  membershipId: string | null;
  permissions: string[];
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return fail(res, 401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    const role = roleSchema.parse(payload.role);
    req.auth = {
      userId: String(payload.sub),
      role,
      schoolId: payload.schoolId ? String(payload.schoolId) : null,
      membershipId: payload.membershipId ? String(payload.membershipId) : null,
      permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : []
    };
    next();
  } catch {
    return fail(res, 401, "TOKEN_EXPIRED", "Token is invalid or expired.");
  }
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.permissions.includes(permission)) {
      return fail(res, 403, "FORBIDDEN", "You do not have permission to perform this action.");
    }
    next();
  };
}

