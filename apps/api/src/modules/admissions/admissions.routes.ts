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

const nullableString = z.preprocess((value) => value === "" ? null : value, z.string().nullable().optional());

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  format: z.enum(["json", "csv"]).default("json")
});

const schemas = {
  applications: z.object({
    applicationNo: z.string().min(2),
    applicantName: z.string().min(2),
    guardianName: z.string().min(2),
    guardianPhone: z.string().min(2),
    desiredClass: z.string().min(1),
    source: z.string().default("ONLINE"),
    appliedOn: z.coerce.date().default(() => new Date()),
    status: z.string().default("SUBMITTED"),
    notes: z.string().optional()
  }),
  enrollments: z.object({
    applicationId: nullableString,
    studentName: z.string().min(2),
    className: z.string().min(1),
    enrollmentNo: z.string().min(2),
    enrolledOn: z.coerce.date().default(() => new Date()),
    status: z.string().default("ENROLLED"),
    notes: z.string().optional()
  }),
  documents: z.object({
    applicationId: nullableString,
    applicantName: z.string().min(2),
    documentType: z.string().min(2),
    fileUrl: z.string().min(2),
    verifiedBy: z.string().optional(),
    status: z.string().default("PENDING"),
    uploadedOn: z.coerce.date().default(() => new Date())
  }),
  reports: z.object({
    title: z.string().min(2),
    period: z.string().min(2),
    metric: z.string().min(2),
    value: z.coerce.number().int().min(0),
    status: z.string().default("PUBLISHED")
  })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  applications: "admissionApplication",
  enrollments: "admissionEnrollment",
  documents: "admissionDocument",
  reports: "admissionReport"
};

const columnsByResource: Record<Resource, string[]> = {
  applications: ["id", "applicationNo", "applicantName", "guardianName", "guardianPhone", "desiredClass", "source", "appliedOn", "status", "notes"],
  enrollments: ["id", "applicationId", "studentName", "className", "enrollmentNo", "enrolledOn", "status", "notes"],
  documents: ["id", "applicationId", "applicantName", "documentType", "fileUrl", "verifiedBy", "uploadedOn", "status"],
  reports: ["id", "title", "period", "metric", "value", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.ADMISSIONS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [applications, enrollments, documents, reports, submitted, shortlisted, enrolled, pendingDocuments] = await Promise.all([
      prisma.admissionApplication.count({ where: { schoolId } }),
      prisma.admissionEnrollment.count({ where: { schoolId } }),
      prisma.admissionDocument.count({ where: { schoolId } }),
      prisma.admissionReport.count({ where: { schoolId } }),
      prisma.admissionApplication.count({ where: { schoolId, status: "SUBMITTED" } }),
      prisma.admissionApplication.count({ where: { schoolId, status: "SHORTLISTED" } }),
      prisma.admissionEnrollment.count({ where: { schoolId, status: "ENROLLED" } }),
      prisma.admissionDocument.count({ where: { schoolId, status: "PENDING" } })
    ]);
    return ok(res, { applications, enrollments, documents, reports, submitted, shortlisted, enrolled, pendingDocuments });
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Admissions record could not be saved.");
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
    fail(res, 404, "NOT_FOUND", "Admissions resource not found.");
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
    applications: ["applicationNo", "applicantName", "guardianName", "guardianPhone", "desiredClass", "source", "notes"],
    enrollments: ["studentName", "className", "enrollmentNo", "notes"],
    documents: ["applicantName", "documentType", "fileUrl", "verifiedBy"],
    reports: ["title", "period", "metric"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "applications") return { appliedOn: "desc" };
  if (resource === "enrollments") return { enrolledOn: "desc" };
  if (resource === "documents") return { uploadedOn: "desc" };
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

export { router as admissionsRoutes };
