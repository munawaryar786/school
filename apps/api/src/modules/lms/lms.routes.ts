import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PERMISSIONS } from "@school-erp/shared";
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

const schemas = {
  courses: z.object({ title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), instructorName: z.string().min(2), description: z.string().min(2), status: z.string().default("PUBLISHED") }),
  materials: z.object({ courseTitle: z.string().min(2), title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), materialType: z.string().default("PDF"), fileUrl: z.string().min(2), status: z.string().default("PUBLISHED") }),
  videos: z.object({ courseTitle: z.string().min(2), title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), videoUrl: z.string().min(2), durationMinutes: z.coerce.number().int().min(1).default(10), status: z.string().default("PUBLISHED") }),
  quizzes: z.object({ courseTitle: z.string().min(2), title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), dueDate: z.coerce.date(), totalMarks: z.coerce.number().int().min(1).default(100), status: z.string().default("PUBLISHED") }),
  progress: z.object({ studentName: z.string().min(2), courseTitle: z.string().min(2), className: z.string().min(1), completedLessons: z.coerce.number().int().min(0).default(0), totalLessons: z.coerce.number().int().min(1).default(1), progressPercent: z.coerce.number().int().min(0).max(100).default(0), status: z.string().default("IN_PROGRESS") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  courses: "lmsCourse",
  materials: "lmsMaterial",
  videos: "lmsVideo",
  quizzes: "lmsQuiz",
  progress: "lmsProgress"
};

const columnsByResource: Record<Resource, string[]> = {
  courses: ["id", "title", "className", "subject", "instructorName", "description", "status"],
  materials: ["id", "courseTitle", "title", "className", "subject", "materialType", "fileUrl", "status"],
  videos: ["id", "courseTitle", "title", "className", "subject", "videoUrl", "durationMinutes", "status"],
  quizzes: ["id", "courseTitle", "title", "className", "subject", "dueDate", "totalMarks", "status"],
  progress: ["id", "studentName", "courseTitle", "className", "completedLessons", "totalLessons", "progressPercent", "status"]
};

router.use(authenticate, requireLmsAccess);

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [courses, materials, videos, quizzes, progress, publishedCourses, completedProgress] = await Promise.all([
      prisma.lmsCourse.count({ where: { schoolId } }),
      prisma.lmsMaterial.count({ where: { schoolId } }),
      prisma.lmsVideo.count({ where: { schoolId } }),
      prisma.lmsQuiz.count({ where: { schoolId } }),
      prisma.lmsProgress.count({ where: { schoolId } }),
      prisma.lmsCourse.count({ where: { schoolId, status: "PUBLISHED" } }),
      prisma.lmsProgress.count({ where: { schoolId, status: "COMPLETED" } })
    ]);
    return ok(res, { courses, materials, videos, quizzes, progress, publishedCourses, completedProgress });
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

router.post("/:resource", requireLmsWrite, async (req, res, next) => {
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "LMS record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", requireLmsWrite, async (req, res, next) => {
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

router.delete("/:resource/:id", requireLmsWrite, async (req, res, next) => {
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

function requireLmsAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.permissions.includes(PERMISSIONS.LMS_ACCESS)) {
    return fail(res, 403, "FORBIDDEN", "You do not have permission to access LMS.");
  }
  next();
}

function requireLmsWrite(req: Request, res: Response, next: NextFunction) {
  const resource = req.params.resource as Resource;
  if (resource === "progress" && req.auth?.permissions.includes(PERMISSIONS.LMS_ACCESS)) {
    return next();
  }
  if (!req.auth?.permissions.includes(PERMISSIONS.LMS_MANAGE)) {
    return fail(res, 403, "FORBIDDEN", "You do not have permission to manage LMS content.");
  }
  next();
}

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "LMS resource not found.");
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
    courses: ["title", "className", "subject", "instructorName", "description"],
    materials: ["courseTitle", "title", "className", "subject", "materialType", "fileUrl"],
    videos: ["courseTitle", "title", "className", "subject", "videoUrl"],
    quizzes: ["courseTitle", "title", "className", "subject"],
    progress: ["studentName", "courseTitle", "className"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "quizzes") return { dueDate: "desc" };
  return { createdAt: "desc" };
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

function isPrismaError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as lmsRoutes };
