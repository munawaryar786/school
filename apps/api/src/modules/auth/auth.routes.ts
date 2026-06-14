import { Router } from "express";
import { PERMISSIONS, loginSchema } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { ok, fail } from "../../http/responses";
import { AuditService } from "../audit/audit.service";
import { PrismaAuthRepository } from "./auth.repository";
import { AuthError, AuthService } from "./auth.service";
import { authenticate, requirePermission } from "./auth.middleware";

const router = Router();
const repository = new PrismaAuthRepository(prisma);
const service = new AuthService(repository, {
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN
});
const audit = new AuditService(prisma);

router.post("/login", async (req, res, next) => {
  try {
    const result = await service.login(loginSchema.parse(req.body));
    await audit.record({
      userId: result.user.id,
      schoolId: result.user.activeSchoolId,
      action: "LOGIN",
      resource: "auth.session",
      ipAddress: req.ip,
      userAgent: req.header("user-agent")
    });
    return ok(res, result);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(res, 401, "AUTHENTICATION_REQUIRED", error.message);
    }
    next(error);
  }
});

router.post("/logout", authenticate, async (req, res, next) => {
  try {
    await service.logout(req.auth!.userId);
    await audit.record({
      userId: req.auth!.userId,
      schoolId: req.auth!.schoolId,
      action: "LOGOUT",
      resource: "auth.session",
      ipAddress: req.ip,
      userAgent: req.header("user-agent")
    });
    return ok(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, requirePermission(PERMISSIONS.PROFILE_READ), (req, res) => {
  return ok(res, {
    userId: req.auth!.userId,
    role: req.auth!.role,
    schoolId: req.auth!.schoolId,
    permissions: req.auth!.permissions
  });
});

export { router as authRoutes };

