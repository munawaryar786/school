import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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

const schemas = {
  "academic-years": z.object({ name: z.string().min(2), startsOn: z.coerce.date(), endsOn: z.coerce.date(), status: z.string().default("ACTIVE") }),
  classes: z.object({ name: z.string().min(1), code: z.string().min(1), status: z.string().default("ACTIVE") }),
  sections: z.object({ classId: z.string().min(1), name: z.string().min(1), capacity: z.coerce.number().int().min(1).default(40), status: z.string().default("ACTIVE") }),
  subjects: z.object({ name: z.string().min(1), code: z.string().min(1), type: z.string().default("CORE"), status: z.string().default("ACTIVE") }),
  teachers: z.object({ employeeNumber: z.string().min(1), name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), specialization: z.string().optional(), status: z.string().default("ACTIVE") }),
  students: z.object({ admissionNumber: z.string().min(1), name: z.string().min(2), guardianName: z.string().min(2), guardianPhone: z.string().min(2), className: z.string().min(1), status: z.string().default("ACTIVE") }),
  fees: z.object({ title: z.string().min(2), amount: z.coerce.number().int().min(0), dueDate: z.coerce.date(), status: z.string().default("PENDING") }),
  exams: z.object({ name: z.string().min(2), subject: z.string().min(1), examDate: z.coerce.date(), status: z.string().default("SCHEDULED") }),
  attendance: z.object({ personName: z.string().min(2), personType: z.string().default("STUDENT"), attendanceDate: z.coerce.date(), status: z.string().default("PRESENT") }),
  library: z.object({ title: z.string().min(2), author: z.string().min(2), isbn: z.string().min(2), copies: z.coerce.number().int().min(1).default(1), status: z.string().default("AVAILABLE") }),
  timetable: z.object({ className: z.string().min(1), subject: z.string().min(1), teacher: z.string().min(1), dayOfWeek: z.string().min(1), startsAt: z.string().min(1), endsAt: z.string().min(1), status: z.string().default("ACTIVE") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  "academic-years": "academicYear",
  classes: "classLevel",
  sections: "section",
  subjects: "subject",
  teachers: "teacherProfile",
  students: "studentProfile",
  fees: "feeRecord",
  exams: "examRecord",
  attendance: "attendanceRecord",
  library: "libraryBook",
  timetable: "timetableSlot"
};

const columnsByResource: Record<Resource, string[]> = {
  "academic-years": ["id", "name", "startsOn", "endsOn", "status"],
  classes: ["id", "name", "code", "status"],
  sections: ["id", "classId", "name", "capacity", "status"],
  subjects: ["id", "name", "code", "type", "status"],
  teachers: ["id", "employeeNumber", "name", "email", "phone", "specialization", "status"],
  students: ["id", "admissionNumber", "name", "guardianName", "guardianPhone", "className", "status"],
  fees: ["id", "title", "amount", "dueDate", "status"],
  exams: ["id", "name", "subject", "examDate", "status"],
  attendance: ["id", "personName", "personType", "attendanceDate", "status"],
  library: ["id", "title", "author", "isbn", "copies", "status"],
  timetable: ["id", "className", "subject", "teacher", "dayOfWeek", "startsAt", "endsAt", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.SCHOOL_OPERATIONS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [academicYears, classes, sections, subjects, teachers, students, fees, exams, attendance, library, timetable] = await Promise.all([
      prisma.academicYear.count({ where: { schoolId } }),
      prisma.classLevel.count({ where: { schoolId } }),
      prisma.section.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } }),
      prisma.teacherProfile.count({ where: { schoolId } }),
      prisma.studentProfile.count({ where: { schoolId } }),
      prisma.feeRecord.count({ where: { schoolId } }),
      prisma.examRecord.count({ where: { schoolId } }),
      prisma.attendanceRecord.count({ where: { schoolId } }),
      prisma.libraryBook.count({ where: { schoolId } }),
      prisma.timetableSlot.count({ where: { schoolId } })
    ]);
    return ok(res, { academicYears, classes, sections, subjects, teachers, students, fees, exams, attendance, library, timetable });
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
    const delegate = prisma[modelByResource[resource]] as any;
    const where = buildWhere(resource, schoolId, query.search, query.status);
    const [rows, total] = await Promise.all([
      delegate.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
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

router.post("/:resource", async (req, res, next) => {
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
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "A record with this unique value already exists.");
    next(error);
  }
});

router.patch("/:resource/:id", async (req, res, next) => {
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

router.delete("/:resource/:id", async (req, res, next) => {
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

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "School Admin resource not found.");
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
  if (status) where.status = status;
  if (!search) return where;
  const searchFields: Record<Resource, string[]> = {
    "academic-years": ["name"],
    classes: ["name", "code"],
    sections: ["name"],
    subjects: ["name", "code", "type"],
    teachers: ["employeeNumber", "name", "email", "specialization"],
    students: ["admissionNumber", "name", "guardianName", "className"],
    fees: ["title"],
    exams: ["name", "subject"],
    attendance: ["personName", "personType"],
    library: ["title", "author", "isbn"],
    timetable: ["className", "subject", "teacher", "dayOfWeek"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
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
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function routeId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as schoolAdminRoutes };
