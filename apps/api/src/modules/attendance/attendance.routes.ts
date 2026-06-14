import { Router } from "express";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PERMISSIONS } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate, requirePermission } from "../auth/auth.middleware";
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

const attendanceSchema = z.object({
  personName: z.string().min(2),
  attendanceDate: z.coerce.date(),
  status: z.string().default("PRESENT"),
  remarks: z.string().optional()
});

const notificationSchema = z.object({
  recipientName: z.string().min(2),
  recipientType: z.string().min(2),
  channel: z.string().default("PORTAL"),
  message: z.string().min(2),
  status: z.string().default("QUEUED"),
  sentAt: z.coerce.date().optional()
});

const schemas = {
  students: attendanceSchema,
  teachers: attendanceSchema,
  staff: attendanceSchema,
  notifications: notificationSchema
} as const;

type Resource = keyof typeof schemas;
type AttendanceResource = Exclude<Resource, "notifications">;

const personTypeByResource: Record<AttendanceResource, string> = {
  students: "STUDENT",
  teachers: "TEACHER",
  staff: "STAFF"
};

const columnsByResource: Record<Resource, string[]> = {
  students: ["id", "personName", "personType", "attendanceDate", "status", "remarks"],
  teachers: ["id", "personName", "personType", "attendanceDate", "status", "remarks"],
  staff: ["id", "personName", "personType", "attendanceDate", "status", "remarks"],
  notifications: ["id", "recipientName", "recipientType", "channel", "message", "status", "sentAt"]
};

router.use(authenticate, requirePermission(PERMISSIONS.ATTENDANCE_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [students, teachers, staff, notifications, presentStudents, absentStudents, sentNotifications] = await Promise.all([
      prisma.attendanceRecord.count({ where: { schoolId, personType: "STUDENT" } }),
      prisma.attendanceRecord.count({ where: { schoolId, personType: "TEACHER" } }),
      prisma.attendanceRecord.count({ where: { schoolId, personType: "STAFF" } }),
      prisma.attendanceNotification.count({ where: { schoolId } }),
      prisma.attendanceRecord.count({ where: { schoolId, personType: "STUDENT", status: "PRESENT" } }),
      prisma.attendanceRecord.count({ where: { schoolId, personType: "STUDENT", status: "ABSENT" } }),
      prisma.attendanceNotification.count({ where: { schoolId, status: "SENT" } })
    ]);
    return ok(res, { students, teachers, staff, notifications, presentStudents, absentStudents, sentNotifications });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = resource === "notifications" ? prisma.attendanceNotification : prisma.attendanceRecord;
    const where = buildWhere(resource, schoolId, query.search, query.status);
    const [rows, total] = await Promise.all([
      (delegate as any).findMany({ where, orderBy: orderByFor(resource), skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      (delegate as any).count({ where })
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

router.post("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const data = schemas[resource].parse(req.body);
    const row = resource === "notifications"
      ? await prisma.attendanceNotification.create({ data: { ...notificationSchema.parse(req.body), schoolId } })
      : await prisma.attendanceRecord.create({ data: { ...attendanceSchema.parse(req.body), schoolId, personType: personTypeByResource[resource] } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Attendance record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const data = schemas[resource].partial().parse(req.body);
    const delegate = resource === "notifications" ? prisma.attendanceNotification : prisma.attendanceRecord;
    await ensureOwnRecord(delegate, routeId(req), schoolId, resource);
    const row = await (delegate as any).update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    next(error);
  }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = resource === "notifications" ? prisma.attendanceNotification : prisma.attendanceRecord;
    await ensureOwnRecord(delegate, routeId(req), schoolId, resource);
    const row = await (delegate as any).delete({ where: { id: routeId(req) } });
    await writeAudit(req, "DELETE", resource, row.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "Attendance resource not found.");
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

function buildWhere(resource: Resource, schoolId: string, search?: string, status?: string) {
  const where: any = { schoolId };
  if (resource !== "notifications") where.personType = personTypeByResource[resource];
  if (status) where.status = status;
  if (!search) return where;
  const searchFields: Record<Resource, string[]> = {
    students: ["personName", "personType", "remarks"],
    teachers: ["personName", "personType", "remarks"],
    staff: ["personName", "personType", "remarks"],
    notifications: ["recipientName", "recipientType", "channel", "message"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "notifications") return { createdAt: "desc" };
  return { attendanceDate: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, schoolId: string, resource: Resource) {
  const where: any = { id, schoolId };
  if (resource !== "notifications") where.personType = personTypeByResource[resource];
  const found = await delegate.findFirst({ where });
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
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
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

export { router as attendanceRoutes };
