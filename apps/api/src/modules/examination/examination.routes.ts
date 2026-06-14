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
  schedules: z.object({ title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), examDate: z.coerce.date(), maxMarks: z.coerce.number().int().min(1).default(100), status: z.string().default("SCHEDULED") }),
  questions: z.object({ className: z.string().min(1), subject: z.string().min(1), questionType: z.string().default("MCQ"), question: z.string().min(2), answer: z.string().min(1), marks: z.coerce.number().int().min(1).default(1), status: z.string().default("ACTIVE") }),
  "online-exams": z.object({ title: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), opensAt: z.coerce.date(), closesAt: z.coerce.date(), durationMinutes: z.coerce.number().int().min(1).default(45), totalMarks: z.coerce.number().int().min(1).default(100), status: z.string().default("DRAFT") }),
  results: z.object({ studentName: z.string().min(2), className: z.string().min(1), subject: z.string().min(1), examTitle: z.string().min(2), marksObtained: z.coerce.number().int().min(0), maxMarks: z.coerce.number().int().min(1).default(100), grade: z.string().min(1), status: z.string().default("RECORDED") }),
  "report-cards": z.object({ studentName: z.string().min(2), className: z.string().min(1), academicYear: z.string().min(2), term: z.string().min(2), totalMarks: z.coerce.number().int().min(1), obtainedMarks: z.coerce.number().int().min(0), grade: z.string().min(1), fileUrl: z.string().optional(), status: z.string().default("PUBLISHED") })
} as const;

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  schedules: "examinationSchedule",
  questions: "questionBankItem",
  "online-exams": "examinationOnlineExam",
  results: "examinationResult",
  "report-cards": "reportCard"
};

const columnsByResource: Record<Resource, string[]> = {
  schedules: ["id", "title", "className", "subject", "examDate", "maxMarks", "status"],
  questions: ["id", "className", "subject", "questionType", "question", "answer", "marks", "status"],
  "online-exams": ["id", "title", "className", "subject", "opensAt", "closesAt", "durationMinutes", "totalMarks", "status"],
  results: ["id", "studentName", "className", "subject", "examTitle", "marksObtained", "maxMarks", "grade", "status"],
  "report-cards": ["id", "studentName", "className", "academicYear", "term", "totalMarks", "obtainedMarks", "grade", "fileUrl", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.EXAMINATION_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const [schedules, questions, onlineExams, results, reportCards, scheduled, publishedResults] = await Promise.all([
      prisma.examinationSchedule.count({ where: { schoolId } }),
      prisma.questionBankItem.count({ where: { schoolId } }),
      prisma.examinationOnlineExam.count({ where: { schoolId } }),
      prisma.examinationResult.count({ where: { schoolId } }),
      prisma.reportCard.count({ where: { schoolId } }),
      prisma.examinationSchedule.count({ where: { schoolId, status: "SCHEDULED" } }),
      prisma.examinationResult.count({ where: { schoolId, status: "PUBLISHED" } })
    ]);
    return ok(res, { schedules, questions, onlineExams, results, reportCards, scheduled, publishedResults });
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
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Examination record could not be saved.");
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
    fail(res, 404, "NOT_FOUND", "Examination resource not found.");
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
    schedules: ["title", "className", "subject"],
    questions: ["className", "subject", "questionType", "question", "answer"],
    "online-exams": ["title", "className", "subject"],
    results: ["studentName", "className", "subject", "examTitle", "grade"],
    "report-cards": ["studentName", "className", "academicYear", "term", "grade", "fileUrl"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function orderByFor(resource: Resource) {
  if (resource === "schedules") return { examDate: "desc" };
  if (resource === "online-exams") return { opensAt: "desc" };
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

export { router as examinationRoutes };
