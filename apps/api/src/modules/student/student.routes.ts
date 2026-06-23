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

const createSchemas = {
  submissions: z.object({
    assignmentTitle: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    content: z.string().min(2),
    attachmentUrl: z.string().optional(),
    status: z.string().default("SUBMITTED")
  }),
  "exam-attempts": z.object({
    examTitle: z.string().min(2),
    subject: z.string().min(1),
    answers: z.record(z.string(), z.string()).default({}),
    status: z.string().default("SUBMITTED")
  }),
  payments: z.object({
    feeTitle: z.string().min(2),
    amount: z.coerce.number().int().min(1),
    paidOn: z.coerce.date().default(() => new Date()),
    method: z.string().default("ONLINE"),
    status: z.string().default("PAID"),
    receiptNumber: z.string().min(2)
  })
} as const;

type Resource =
  | "attendance"
  | "timetable"
  | "assignments"
  | "submissions"
  | "materials"
  | "results"
  | "online-exams"
  | "exam-attempts"
  | "certificates"
  | "transcripts"
  | "fees"
  | "payments";

type WritableResource = keyof typeof createSchemas;

const resources: Resource[] = ["attendance", "timetable", "assignments", "submissions", "materials", "results", "online-exams", "exam-attempts", "certificates", "transcripts", "fees", "payments"];

const modelByResource: Record<Resource, keyof typeof prisma> = {
  attendance: "teacherAttendance",
  timetable: "timetableSlot",
  assignments: "teacherAssignment",
  submissions: "studentAssignmentSubmission",
  materials: "teacherMaterial",
  results: "teacherMark",
  "online-exams": "studentOnlineExam",
  "exam-attempts": "studentOnlineExamAttempt",
  certificates: "studentCertificate",
  transcripts: "studentTranscript",
  fees: "financeInvoice",
  payments: "studentFeePayment"
};

const columnsByResource: Record<Resource, string[]> = {
  attendance: ["id", "studentName", "className", "attendanceDate", "status", "remarks"],
  timetable: ["id", "className", "subject", "teacher", "dayOfWeek", "startsAt", "endsAt", "status"],
  assignments: ["id", "title", "className", "subject", "dueDate", "maxMarks", "status"],
  submissions: ["id", "assignmentTitle", "className", "subject", "content", "attachmentUrl", "status", "submittedAt"],
  materials: ["id", "title", "className", "subject", "resourceType", "url", "status"],
  results: ["id", "studentName", "className", "subject", "assessment", "marksObtained", "maxMarks", "status"],
  "online-exams": ["id", "title", "className", "subject", "opensAt", "closesAt", "durationMinutes", "status"],
  "exam-attempts": ["id", "examTitle", "subject", "score", "status", "submittedAt"],
  certificates: ["id", "title", "certificateNumber", "issuedOn", "fileUrl", "status"],
  transcripts: ["id", "title", "academicYear", "gpa", "fileUrl", "status"],
  fees: ["id", "invoiceNumber", "studentName", "feeTitle", "amount", "dueDate", "status"],
  payments: ["id", "feeTitle", "amount", "paidOn", "method", "status", "receiptNumber"]
};

router.use(authenticate, requirePermission(PERMISSIONS.STUDENT_PORTAL_ACCESS));

router.get("/dashboard", async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const [attendance, timetable, assignments, submissions, materials, results, onlineExams, examAttempts, certificates, transcripts, fees, payments] = await Promise.all([
      prisma.teacherAttendance.count({ where: whereFor("attendance", scope) }),
      prisma.timetableSlot.count({ where: whereFor("timetable", scope) }),
      prisma.teacherAssignment.count({ where: whereFor("assignments", scope) }),
      prisma.studentAssignmentSubmission.count({ where: whereFor("submissions", scope) }),
      prisma.teacherMaterial.count({ where: whereFor("materials", scope) }),
      prisma.teacherMark.count({ where: whereFor("results", scope) }),
      prisma.studentOnlineExam.count({ where: whereFor("online-exams", scope) }),
      prisma.studentOnlineExamAttempt.count({ where: whereFor("exam-attempts", scope) }),
      prisma.studentCertificate.count({ where: whereFor("certificates", scope) }),
      prisma.studentTranscript.count({ where: whereFor("transcripts", scope) }),
      prisma.financeInvoice.count({ where: whereFor("fees", scope) }),
      prisma.studentFeePayment.count({ where: whereFor("payments", scope) })
    ]);
    return ok(res, { attendance, timetable, assignments, submissions, materials, results, onlineExams, examAttempts, certificates, transcripts, fees, payments, profile: scope.profile });
  } catch (error) {
    next(error);
  }
});

router.get("/timetable", async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const rows = await prisma.timetableSlot.findMany({
      where: { schoolId: scope.schoolId, className: scope.className, status: "ACTIVE" },
      orderBy: [{ dayOfWeek: "asc" }, { startsAt: "asc" }]
    });
    return ok(res, rows);
  } catch (error) {
    next(error);
  }
});
router.get("/fees", async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const query = pageQuerySchema.parse(req.query);
    const where = withSearch("fees", { schoolId: scope.schoolId, studentName: scope.studentName }, query.search, query.status);
    const [rows, total] = await Promise.all([
      prisma.financeInvoice.findMany({ where, orderBy: { dueDate: "asc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.financeInvoice.count({ where })
    ]);
    const payments = await prisma.financePayment.groupBy({ by: ["invoiceNumber"], where: { schoolId: scope.schoolId, invoiceNumber: { in: rows.map((row) => row.invoiceNumber) } }, _sum: { amount: true } });
    const paidByInvoice = new Map(payments.map((item: any) => [item.invoiceNumber, item._sum.amount ?? 0]));
    return paginated(res, rows.map((row) => serializeFeeInvoice(row, paidByInvoice.get(row.invoiceNumber) ?? 0)), query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});
router.get("/homework", async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const query = pageQuerySchema.parse(req.query);
    const where = withSearch("assignments", whereFor("assignments", scope), query.search, query.status);
    const [rows, total] = await Promise.all([
      prisma.teacherAssignment.findMany({ where, orderBy: { dueDate: "asc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.teacherAssignment.count({ where })
    ]);
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.get("/lms", async (req, res, next) => {
  try {
    const scope = await requireStudentScope(req, res);
    if (!scope) return;
    const query = pageQuerySchema.parse(req.query);
    const where = withSearch("materials", whereFor("materials", scope), query.search, query.status);
    const [rows, total] = await Promise.all([
      prisma.teacherMaterial.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.teacherMaterial.count({ where })
    ]);
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});
router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const scope = await requireStudentScope(req, res);
    if (!resource || !scope) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = prisma[modelByResource[resource]] as any;
    const where = withSearch(resource, whereFor(resource, scope), query.search, query.status);
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
    const resource = parseWritableResource(req, res);
    const scope = await requireStudentScope(req, res);
    if (!resource || !scope) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = createSchemas[resource].parse(req.body);
    const row = await delegate.create({ data: { ...data, schoolId: scope.schoolId, studentId: scope.studentId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Student record could not be saved.");
    next(error);
  }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseWritableResource(req, res);
    const scope = await requireStudentScope(req, res);
    if (!resource || !scope) return;
    const delegate = prisma[modelByResource[resource]] as any;
    await ensureOwnRecord(delegate, routeId(req), scope);
    const row = await delegate.delete({ where: { id: routeId(req) } });
    await writeAudit(req, "DELETE", resource, row.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function serializeFeeInvoice(row: any, paidAmount: number) {
  const balanceAmount = Math.max(0, Number(row.amount ?? 0) - paidAmount);
  return { ...row, paidAmount, balanceAmount };
}
function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resources.includes(resource)) {
    fail(res, 404, "NOT_FOUND", "Student resource not found.");
    return null;
  }
  return resource;
}

function parseWritableResource(req: Request, res: Response): WritableResource | null {
  const resource = req.params.resource as WritableResource;
  if (!resource || !(resource in createSchemas)) {
    fail(res, 403, "FORBIDDEN", "This student resource is read-only.");
    return null;
  }
  return resource;
}

async function requireStudentScope(req: Request, res: Response) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) {
    fail(res, 401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    return null;
  }
  const profile = await prisma.studentProfile.findFirst({
    where: { schoolId: req.auth.schoolId, name: user.name, status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });
  return {
    schoolId: req.auth.schoolId,
    studentId: req.auth.userId,
    studentName: profile?.name ?? user.name,
    className: profile?.className ?? "Grade 1",
    profile: {
      name: profile?.name ?? user.name,
      admissionNumber: profile?.admissionNumber ?? null,
      className: profile?.className ?? "Grade 1",
      guardianName: profile?.guardianName ?? null
    }
  };
}

function whereFor(resource: Resource, scope: { schoolId: string; studentId: string; studentName: string; className: string }) {
  const schoolId = scope.schoolId;
  switch (resource) {
    case "attendance":
      return { schoolId, studentName: scope.studentName };
    case "timetable":
      return { schoolId, className: scope.className };
    case "assignments":
      return { schoolId, className: scope.className, status: { not: "DRAFT" } };
    case "submissions":
      return { schoolId, studentId: scope.studentId };
    case "materials":
      return { schoolId, className: scope.className, status: { not: "DRAFT" } };
    case "results":
      return { schoolId, studentName: scope.studentName };
    case "online-exams":
      return { schoolId, className: scope.className };
    case "exam-attempts":
      return { schoolId, studentId: scope.studentId };
    case "certificates":
      return { schoolId, studentId: scope.studentId };
    case "transcripts":
      return { schoolId, studentId: scope.studentId };
    case "fees":
      return { schoolId, studentName: scope.studentName };
    case "payments":
      return { schoolId, studentId: scope.studentId };
  }
}

function withSearch(resource: Resource, where: any, search?: string, status?: string) {
  const next = { ...where };
  if (status) {
    if (typeof next.status === "object" && next.status?.not === status) {
      next.status = "__NO_MATCH__";
    } else {
      next.status = status;
    }
  }
  if (!search) return next;
  const searchFields: Record<Resource, string[]> = {
    attendance: ["studentName", "className", "remarks"],
    timetable: ["className", "subject", "teacher", "dayOfWeek"],
    assignments: ["title", "className", "subject"],
    submissions: ["assignmentTitle", "className", "subject", "content", "attachmentUrl"],
    materials: ["title", "className", "subject", "resourceType", "url"],
    results: ["studentName", "className", "subject", "assessment"],
    "online-exams": ["title", "className", "subject"],
    "exam-attempts": ["examTitle", "subject"],
    certificates: ["title", "certificateNumber", "fileUrl"],
    transcripts: ["title", "academicYear", "gpa", "fileUrl"],
    fees: ["invoiceNumber", "studentName", "feeTitle"],
    payments: ["feeTitle", "method", "receiptNumber"]
  };
  next.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return next;
}

function orderByFor(resource: Resource) {
  if (resource === "timetable") return [{ dayOfWeek: "asc" }, { startsAt: "asc" }];
  if (resource === "attendance") return { attendanceDate: "desc" };
  if (resource === "assignments") return { dueDate: "asc" };
  if (resource === "online-exams") return { opensAt: "asc" };
  if (resource === "fees") return { dueDate: "asc" };
  if (resource === "payments") return { paidOn: "desc" };
  if (resource === "certificates") return { issuedOn: "desc" };
  return { createdAt: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, scope: { schoolId: string; studentId: string }) {
  const found = await delegate.findFirst({ where: { id, schoolId: scope.schoolId, studentId: scope.studentId } });
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

export { router as studentRoutes };

