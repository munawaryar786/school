// @ts-nocheck
import { Router } from "express";
import { PERMISSIONS } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { AuditService } from "../audit/audit.service";
import { ensureCommonSubjects, ensureStandardClasses, isUniqueConstraintError } from "./school-admin.core-setup";

const router = Router();
const audit = new AuditService(prisma);

router.use(authenticate, requirePermission(PERMISSIONS.SCHOOL_OPERATIONS_MANAGE));

router.post("/classes/standard-1-12", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const result = await ensureStandardClasses(schoolId);
    await writeAudit(req, "CREATE", "classes", "standard-1-12", { created: result.created, existing: result.existing });
    return ok(res, result, 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) return fail(res, 409, "CONFLICT", "Standard classes could not be created because one or more class codes already exist.");
    next(error);
  }
});

router.post("/subjects/common", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const result = await ensureCommonSubjects(schoolId);
    await writeAudit(req, "CREATE", "subjects", "common", { created: result.created, existing: result.existing });
    return ok(res, result, 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) return fail(res, 409, "CONFLICT", "Common subjects could not be created because one or more subject codes already exist.");
    next(error);
  }
});

function requireSchool(req: any, res: any) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  return req.auth.schoolId;
}

async function writeAudit(req: any, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as schoolAdminCoreSetupRoutes };
