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

const schemas = {
  "student-reports": z.object({ title: z.string().min(2), studentName: z.string().min(2), className: z.string().min(1), academicYear: z.string().min(2), metric: z.string().min(2), value: z.coerce.number().int().min(0), status: z.string().default("PUBLISHED") }),
  "teacher-reports": z.object({ title: z.string().min(2), teacherName: z.string().min(2), department: z.string().min(2), metric: z.string().min(2), value: z.coerce.number().int().min(0), status: z.string().default("PUBLISHED") }),
  "attendance-reports": z.object({ title: z.string().min(2), period: z.string().min(2), personType: z.string().min(2), presentCount: z.coerce.number().int().min(0), absentCount: z.coerce.number().int().min(0), status: z.string().default("PUBLISHED") }),
  "financial-reports": z.object({ title: z.string().min(2), period: z.string().min(2), revenueAmount: z.coerce.number().int().min(0), expenseAmount: z.coerce.number().int().min(0), balanceAmount: z.coerce.number().int(), status: z.string().default("PUBLISHED") }),
  dashboards: z.object({ title: z.string().min(2), audience: z.string().min(2), widgetCount: z.coerce.number().int().min(1), refreshCadence: z.string().default("DAILY"), status: z.string().default("PUBLISHED") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  "student-reports": "studentAnalyticsReport",
  "teacher-reports": "teacherAnalyticsReport",
  "attendance-reports": "attendanceAnalyticsReport",
  "financial-reports": "financialAnalyticsReport",
  dashboards: "analyticsDashboard"
};

const columnsByResource: Record<Resource, string[]> = {
  "student-reports": ["id", "title", "studentName", "className", "academicYear", "metric", "value", "status"],
  "teacher-reports": ["id", "title", "teacherName", "department", "metric", "value", "status"],
  "attendance-reports": ["id", "title", "period", "personType", "presentCount", "absentCount", "status"],
  "financial-reports": ["id", "title", "period", "revenueAmount", "expenseAmount", "balanceAmount", "status"],
  dashboards: ["id", "title", "audience", "widgetCount", "refreshCadence", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.REPORTS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [studentReports, teacherReports, attendanceReports, financialReports, dashboards, financialAggregate, attendanceAggregate] = await Promise.all([
      prisma.studentAnalyticsReport.count({ where: { schoolId } }),
      prisma.teacherAnalyticsReport.count({ where: { schoolId } }),
      prisma.attendanceAnalyticsReport.count({ where: { schoolId } }),
      prisma.financialAnalyticsReport.count({ where: { schoolId } }),
      prisma.analyticsDashboard.count({ where: { schoolId } }),
      prisma.financialAnalyticsReport.aggregate({ where: { schoolId }, _sum: { revenueAmount: true, expenseAmount: true, balanceAmount: true } }),
      prisma.attendanceAnalyticsReport.aggregate({ where: { schoolId }, _sum: { presentCount: true, absentCount: true } })
    ]);
    return ok(res, {
      studentReports,
      teacherReports,
      attendanceReports,
      financialReports,
      dashboards,
      revenueAmount: financialAggregate._sum.revenueAmount ?? 0,
      expenseAmount: financialAggregate._sum.expenseAmount ?? 0,
      balanceAmount: financialAggregate._sum.balanceAmount ?? 0,
      presentCount: attendanceAggregate._sum.presentCount ?? 0,
      absentCount: attendanceAggregate._sum.absentCount ?? 0
    });
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Report record could not be saved.");
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
    fail(res, 404, "NOT_FOUND", "Reports resource not found.");
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
    "student-reports": ["title", "studentName", "className", "academicYear", "metric"],
    "teacher-reports": ["title", "teacherName", "department", "metric"],
    "attendance-reports": ["title", "period", "personType"],
    "financial-reports": ["title", "period"],
    dashboards: ["title", "audience", "refreshCadence"]
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

function isPrismaError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as reportsRoutes };
