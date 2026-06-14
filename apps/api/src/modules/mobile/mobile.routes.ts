import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PERMISSIONS, ROLES } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate } from "../auth/auth.middleware";
import { AuditService } from "../audit/audit.service";

const router = Router();
const audit = new AuditService(prisma);

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  format: z.enum(["json", "csv"]).default("json")
});

const registerDeviceSchema = z.object({
  deviceToken: z.string().min(6),
  platform: z.string().min(2),
  appVersion: z.string().min(1)
});

const schemas = {
  devices: z.object({ userName: z.string().min(2), userEmail: z.string().email(), role: z.string().min(2), deviceToken: z.string().min(6), platform: z.string().min(2), appVersion: z.string().min(1), status: z.string().default("ACTIVE"), lastSeenAt: z.coerce.date().optional() }),
  "sync-logs": z.object({ userEmail: z.string().email(), role: z.string().min(2), endpoint: z.string().min(2), syncType: z.string().min(2), recordsSynced: z.coerce.number().int().min(0).default(0), status: z.string().default("SUCCESS"), syncedAt: z.coerce.date().optional(), metadata: z.record(z.string(), z.unknown()).optional() })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  devices: "mobileDevice",
  "sync-logs": "mobileSyncLog"
};

const columnsByResource: Record<Resource, string[]> = {
  devices: ["id", "userName", "userEmail", "role", "deviceToken", "platform", "appVersion", "status", "lastSeenAt"],
  "sync-logs": ["id", "userEmail", "role", "endpoint", "syncType", "recordsSynced", "status", "syncedAt", "metadata"]
};

router.use(authenticate);

router.get("/dashboard", requireMobileManage, async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [devices, activeDevices, syncLogs, successfulSyncs, studentApiCalls, teacherApiCalls, parentApiCalls] = await Promise.all([
      prisma.mobileDevice.count({ where: { schoolId } }),
      prisma.mobileDevice.count({ where: { schoolId, status: "ACTIVE" } }),
      prisma.mobileSyncLog.count({ where: { schoolId } }),
      prisma.mobileSyncLog.count({ where: { schoolId, status: "SUCCESS" } }),
      prisma.mobileSyncLog.count({ where: { schoolId, role: ROLES.STUDENT } }),
      prisma.mobileSyncLog.count({ where: { schoolId, role: ROLES.TEACHER } }),
      prisma.mobileSyncLog.count({ where: { schoolId, role: ROLES.PARENT } })
    ]);
    return ok(res, { devices, activeDevices, syncLogs, successfulSyncs, studentApiCalls, teacherApiCalls, parentApiCalls });
  } catch (error) {
    next(error);
  }
});

router.post("/devices/register", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    if (![ROLES.STUDENT, ROLES.TEACHER, ROLES.PARENT].includes(req.auth?.role as any)) {
      return fail(res, 403, "FORBIDDEN", "Only mobile app roles can register devices.");
    }
    const user = await currentUser(req, res);
    if (!user) return;
    const data = registerDeviceSchema.parse(req.body);
    const device = await prisma.mobileDevice.upsert({
      where: { schoolId_deviceToken: { schoolId, deviceToken: data.deviceToken } },
      update: { userName: user.name, userEmail: user.email, role: req.auth!.role, platform: data.platform, appVersion: data.appVersion, status: "ACTIVE", lastSeenAt: new Date() },
      create: { schoolId, userName: user.name, userEmail: user.email, role: req.auth!.role, deviceToken: data.deviceToken, platform: data.platform, appVersion: data.appVersion, status: "ACTIVE", lastSeenAt: new Date() }
    });
    await writeAudit(req, "CREATE", "mobile-device", device.id, { platform: data.platform, appVersion: data.appVersion });
    return ok(res, device, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Mobile device could not be registered.");
    next(error);
  }
});

router.get("/student/dashboard", requireRolePermission(ROLES.STUDENT, PERMISSIONS.STUDENT_PORTAL_ACCESS), async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const [attendance, timetable, assignments, materials, results, onlineExams, certificates, fees, payments] = await Promise.all([
      prisma.teacherAttendance.count({ where: { schoolId: scope.schoolId, studentName: scope.studentName } }),
      prisma.timetableSlot.count({ where: { schoolId: scope.schoolId, className: scope.className } }),
      prisma.teacherAssignment.count({ where: { schoolId: scope.schoolId, className: scope.className, status: { not: "DRAFT" } } }),
      prisma.teacherMaterial.count({ where: { schoolId: scope.schoolId, className: scope.className, status: { not: "DRAFT" } } }),
      prisma.teacherMark.count({ where: { schoolId: scope.schoolId, studentName: scope.studentName } }),
      prisma.studentOnlineExam.count({ where: { schoolId: scope.schoolId, className: scope.className } }),
      prisma.studentCertificate.count({ where: { schoolId: scope.schoolId, studentId: scope.studentId } }),
      prisma.feeRecord.count({ where: { schoolId: scope.schoolId } }),
      prisma.studentFeePayment.count({ where: { schoolId: scope.schoolId, studentId: scope.studentId } })
    ]);
    await recordSync(req, "/api/v1/mobile/student/dashboard", "DASHBOARD", attendance + timetable + assignments + materials + results + onlineExams + certificates + fees + payments);
    return ok(res, { profile: scope.profile, attendance, timetable, assignments, materials, results, onlineExams, certificates, fees, payments });
  } catch (error) {
    next(error);
  }
});

router.get("/teacher/dashboard", requireRolePermission(ROLES.TEACHER, PERMISSIONS.TEACHER_OPERATIONS_MANAGE), async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const scope = { schoolId, teacherId: req.auth!.userId };
    const [classes, attendance, assignments, exams, marks, materials, messages, onlineClasses] = await Promise.all([
      prisma.teacherClassroom.count({ where: scope }),
      prisma.teacherAttendance.count({ where: scope }),
      prisma.teacherAssignment.count({ where: scope }),
      prisma.teacherExamPlan.count({ where: scope }),
      prisma.teacherMark.count({ where: scope }),
      prisma.teacherMaterial.count({ where: scope }),
      prisma.parentCommunication.count({ where: scope }),
      prisma.onlineClass.count({ where: scope })
    ]);
    await recordSync(req, "/api/v1/mobile/teacher/dashboard", "DASHBOARD", classes + attendance + assignments + exams + marks + materials + messages + onlineClasses);
    return ok(res, { classes, attendance, assignments, exams, marks, materials, messages, onlineClasses });
  } catch (error) {
    next(error);
  }
});

router.get("/parent/dashboard", requireRolePermission(ROLES.PARENT, PERMISSIONS.PARENT_PORTAL_ACCESS), async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    const [attendance, results, homework, fees, payments, messages] = await Promise.all([
      prisma.teacherAttendance.count({ where: { schoolId: scope.schoolId, studentName: { in: scope.childNames } } }),
      prisma.teacherMark.count({ where: { schoolId: scope.schoolId, studentName: { in: scope.childNames } } }),
      prisma.teacherAssignment.count({ where: { schoolId: scope.schoolId, className: { in: scope.classNames }, status: { not: "DRAFT" } } }),
      prisma.feeRecord.count({ where: { schoolId: scope.schoolId } }),
      prisma.parentFeePayment.count({ where: { schoolId: scope.schoolId, parentId: scope.parentId } }),
      prisma.parentPortalMessage.count({ where: { schoolId: scope.schoolId, parentId: scope.parentId } })
    ]);
    await recordSync(req, "/api/v1/mobile/parent/dashboard", "DASHBOARD", scope.children.length + attendance + results + homework + fees + payments + messages);
    return ok(res, { children: scope.children, attendance, results, homework, fees, payments, messages });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", requireMobileManage, async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = prisma[modelByResource[resource]] as any;
    const where = buildWhere(resource, schoolId, query.search, query.status);
    const [rows, total] = await Promise.all([
      delegate.findMany({ where, orderBy: orderByFor(resource), skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      delegate.count({ where })
    ]);
    if (query.format === "csv") {
      await writeAudit(req, "EXPORT", resource, "csv", { search: query.search, status: query.status });
      return csv(res, `${resource}.csv`, rows, columnsByResource[resource]);
    }
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/:resource", requireMobileManage, async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].parse(req.body);
    const row = await delegate.create({ data: { ...data, schoolId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Mobile API record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", requireMobileManage, async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].partial().parse(req.body);
    await ensureOwnRecord(delegate, routeId(req), schoolId);
    const row = await delegate.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    next(error);
  }
});

router.delete("/:resource/:id", requireMobileManage, async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prisma[modelByResource[resource]] as any;
    await ensureOwnRecord(delegate, routeId(req), schoolId);
    const row = await delegate.delete({ where: { id: routeId(req) } });
    await writeAudit(req, "DELETE", resource, row.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function requireMobileManage(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.permissions.includes(PERMISSIONS.MOBILE_API_MANAGE)) {
    return fail(res, 403, "FORBIDDEN", "You do not have permission to manage mobile APIs.");
  }
  next();
}

function requireRolePermission(role: string, permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.role !== role || !req.auth.permissions.includes(permission)) {
      return fail(res, 403, "FORBIDDEN", "This mobile API is not available for the current role.");
    }
    next();
  };
}

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "Mobile API resource not found.");
    return null;
  }
  return resource;
}

function requireSchool(req: Request, res: Response) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  return req.auth.schoolId;
}

async function currentUser(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.auth?.userId } });
  if (!user) {
    fail(res, 401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    return null;
  }
  return user;
}

async function requireStudentScope(req: Request, res: Response) {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return null;
  const user = await currentUser(req, res);
  if (!user) return null;
  const profile = await prisma.studentProfile.findFirst({ where: { schoolId, name: user.name, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return {
    schoolId,
    studentId: req.auth!.userId,
    studentName: profile?.name ?? user.name,
    className: profile?.className ?? "Grade 1",
    profile: { name: profile?.name ?? user.name, admissionNumber: profile?.admissionNumber ?? null, className: profile?.className ?? "Grade 1" }
  };
}

async function requireParentScope(req: Request, res: Response) {
  const schoolId = requireSchool(req, res);
  if (!schoolId) return null;
  const parent = await currentUser(req, res);
  if (!parent) return null;
  const children = await prisma.studentProfile.findMany({ where: { schoolId, guardianName: parent.name, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return {
    schoolId,
    parentId: req.auth!.userId,
    children,
    childNames: children.map((child) => child.name),
    classNames: [...new Set(children.map((child) => child.className))]
  };
}

async function recordSync(req: Request, endpoint: string, syncType: string, recordsSynced: number) {
  if (!req.auth?.schoolId) return;
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) return;
  await prisma.mobileSyncLog.create({
    data: {
      schoolId: req.auth.schoolId,
      userEmail: user.email,
      role: req.auth.role,
      endpoint,
      syncType,
      recordsSynced,
      status: "SUCCESS",
      syncedAt: new Date(),
      metadata: { userAgent: req.header("user-agent") ?? null }
    }
  });
}

function buildWhere(resource: Resource, schoolId: string, search?: string, status?: string) {
  const where: any = { schoolId };
  if (status) where.status = status;
  if (!search) return where;
  const searchFields: Record<Resource, string[]> = {
    devices: ["userName", "userEmail", "role", "deviceToken", "platform", "appVersion"],
    "sync-logs": ["userEmail", "role", "endpoint", "syncType", "status"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "devices") return { lastSeenAt: "desc" };
  return { syncedAt: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, schoolId: string) {
  const found = await delegate.findFirst({ where: { id, schoolId } });
  if (!found) {
    throw Object.assign(new Error("Record not found."), { statusCode: 404 });
  }
}

function paginated<T>(res: Response, data: T[], page: number, pageSize: number, total: number) {
  return res.json({ success: true, data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, meta: { requestId: res.locals.requestId } });
}

function csv(res: Response, filename: string, rows: Array<Record<string, unknown>>, headers: string[]) {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  return res.send(body);
}

function escapeCsv(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function routeId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function isPrismaError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as mobileRoutes };
