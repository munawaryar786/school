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
  payments: z.object({
    studentName: z.string().min(2),
    feeTitle: z.string().min(2),
    amount: z.coerce.number().int().min(1),
    paidOn: z.coerce.date().default(() => new Date()),
    method: z.string().default("ONLINE"),
    status: z.string().default("PAID"),
    receiptNumber: z.string().min(2)
  }),
  communication: z.object({
    studentName: z.string().min(2),
    channel: z.string().default("PORTAL"),
    subject: z.string().min(2),
    message: z.string().min(2),
    status: z.string().default("SENT")
  })
} as const;

type Resource = "children" | "attendance" | "results" | "performance" | "homework" | "fees" | "payments" | "communication";
type WritableResource = keyof typeof createSchemas;

const resources: Resource[] = ["children", "attendance", "results", "performance", "homework", "fees", "payments", "communication"];

const columnsByResource: Record<Resource, string[]> = {
  children: ["id", "admissionNumber", "name", "guardianName", "guardianPhone", "className", "status"],
  attendance: ["id", "studentName", "className", "attendanceDate", "status", "remarks"],
  results: ["id", "studentName", "className", "subject", "assessment", "marksObtained", "maxMarks", "status"],
  performance: ["id", "studentName", "className", "attendanceRate", "averageScore", "homeworkOpen", "pendingFees", "paidPayments"],
  homework: ["id", "title", "className", "subject", "dueDate", "maxMarks", "status"],
  fees: ["id", "title", "amount", "dueDate", "status"],
  payments: ["id", "studentName", "feeTitle", "amount", "paidOn", "method", "status", "receiptNumber"],
  communication: ["id", "source", "studentName", "channel", "subject", "message", "status", "createdAt"]
};

router.use(authenticate, requirePermission(PERMISSIONS.PARENT_PORTAL_ACCESS));

router.get("/dashboard", async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    const [attendance, results, homework, fees, payments, inboundMessages, outboundMessages] = await Promise.all([
      prisma.teacherAttendance.count({ where: whereFor("attendance", scope) }),
      prisma.teacherMark.count({ where: whereFor("results", scope) }),
      prisma.teacherAssignment.count({ where: whereFor("homework", scope) }),
      prisma.feeRecord.count({ where: whereFor("fees", scope) }),
      prisma.parentFeePayment.count({ where: whereFor("payments", scope) }),
      prisma.parentCommunication.count({ where: inboundCommunicationWhere(scope) }),
      prisma.parentPortalMessage.count({ where: whereFor("communication", scope) })
    ]);
    const performance = await buildPerformance(scope);
    return ok(res, {
      children: scope.children.length,
      attendance,
      results,
      performance: performance.length,
      homework,
      fees,
      payments,
      communication: inboundMessages + outboundMessages,
      childProfiles: scope.children,
      performanceSummary: performance
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const scope = await requireParentScope(req, res);
    if (!resource || !scope) return;
    const query = pageQuerySchema.parse(req.query);
    const rows = await listResource(resource, scope, query.search, query.status);
    const total = rows.length;
    const pagedRows = rows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    if (query.format === "csv") {
      await writeAudit(req, "EXPORT", resource, "csv", { search: query.search, status: query.status });
      return csv(res, `${resource}.csv`, rows, columnsByResource[resource]);
    }
    return paginated(res, pagedRows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/:resource", async (req, res, next) => {
  try {
    const resource = parseWritableResource(req, res);
    const scope = await requireParentScope(req, res);
    if (!resource || !scope) return;
    const data = createSchemas[resource].parse(req.body);
    if (!scope.childNames.includes(data.studentName)) {
      return fail(res, 403, "FORBIDDEN", "This child is not linked to the parent account.");
    }
    const delegate = resource === "payments" ? prisma.parentFeePayment : prisma.parentPortalMessage;
    const row = await (delegate as any).create({ data: { ...data, schoolId: scope.schoolId, parentId: scope.parentId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Parent record could not be saved.");
    next(error);
  }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseWritableResource(req, res);
    const scope = await requireParentScope(req, res);
    if (!resource || !scope) return;
    const delegate = resource === "payments" ? prisma.parentFeePayment : prisma.parentPortalMessage;
    await ensureOwnRecord(delegate, routeId(req), scope);
    const row = await (delegate as any).delete({ where: { id: routeId(req) } });
    await writeAudit(req, "DELETE", resource, row.id, {});
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resources.includes(resource)) {
    fail(res, 404, "NOT_FOUND", "Parent resource not found.");
    return null;
  }
  return resource;
}

function parseWritableResource(req: Request, res: Response): WritableResource | null {
  const resource = req.params.resource as WritableResource;
  if (!resource || !(resource in createSchemas)) {
    fail(res, 403, "FORBIDDEN", "This parent resource is read-only.");
    return null;
  }
  return resource;
}

async function requireParentScope(req: Request, res: Response) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  const parent = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!parent) {
    fail(res, 401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    return null;
  }
  const children = await prisma.studentProfile.findMany({
    where: { schoolId: req.auth.schoolId, guardianName: parent.name, status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });
  return {
    schoolId: req.auth.schoolId,
    parentId: req.auth.userId,
    parentName: parent.name,
    children,
    childNames: children.map((child) => child.name),
    classNames: [...new Set(children.map((child) => child.className))]
  };
}

async function listResource(resource: Resource, scope: ParentScope, search?: string, status?: string) {
  if (resource === "children") return filterRows(scope.children, search, status, ["admissionNumber", "name", "guardianName", "guardianPhone", "className"]);
  if (resource === "performance") return filterRows(await buildPerformance(scope), search, status, ["studentName", "className"]);
  if (resource === "communication") return filterRows(await listCommunication(scope), search, status, ["source", "studentName", "channel", "subject", "message"]);

  const delegateByResource: Record<Exclude<Resource, "children" | "performance" | "communication">, any> = {
    attendance: prisma.teacherAttendance,
    results: prisma.teacherMark,
    homework: prisma.teacherAssignment,
    fees: prisma.feeRecord,
    payments: prisma.parentFeePayment
  };
  const rows = await delegateByResource[resource].findMany({ where: withSearch(whereFor(resource, scope), search, status, resource), orderBy: orderByFor(resource) });
  return rows;
}

function whereFor(resource: Exclude<Resource, "children" | "performance">, scope: ParentScope) {
  const schoolId = scope.schoolId;
  switch (resource) {
    case "attendance":
      return { schoolId, studentName: { in: scope.childNames } };
    case "results":
      return { schoolId, studentName: { in: scope.childNames } };
    case "homework":
      return { schoolId, className: { in: scope.classNames }, status: { not: "DRAFT" } };
    case "fees":
      return { schoolId };
    case "payments":
      return { schoolId, parentId: scope.parentId };
    case "communication":
      return { schoolId, parentId: scope.parentId };
  }
}

function inboundCommunicationWhere(scope: ParentScope) {
  return { schoolId: scope.schoolId, guardianName: scope.parentName, studentName: { in: scope.childNames } };
}

async function listCommunication(scope: ParentScope) {
  const [inbound, outbound] = await Promise.all([
    prisma.parentCommunication.findMany({ where: inboundCommunicationWhere(scope), orderBy: { createdAt: "desc" } }),
    prisma.parentPortalMessage.findMany({ where: whereFor("communication", scope), orderBy: { createdAt: "desc" } })
  ]);
  return [
    ...inbound.map((row) => ({ id: row.id, source: "Teacher", studentName: row.studentName, channel: row.channel, subject: row.subject, message: row.message, status: row.status, createdAt: row.createdAt })),
    ...outbound.map((row) => ({ id: row.id, source: "Parent", studentName: row.studentName, channel: row.channel, subject: row.subject, message: row.message, status: row.status, createdAt: row.createdAt }))
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

async function buildPerformance(scope: ParentScope) {
  return Promise.all(scope.children.map(async (child) => {
    const [attendance, results, homeworkOpen, pendingFees, paidPayments] = await Promise.all([
      prisma.teacherAttendance.findMany({ where: { schoolId: scope.schoolId, studentName: child.name } }),
      prisma.teacherMark.findMany({ where: { schoolId: scope.schoolId, studentName: child.name } }),
      prisma.teacherAssignment.count({ where: { schoolId: scope.schoolId, className: child.className, status: "PUBLISHED" } }),
      prisma.feeRecord.count({ where: { schoolId: scope.schoolId, status: { in: ["PENDING", "OVERDUE"] } } }),
      prisma.parentFeePayment.count({ where: { schoolId: scope.schoolId, parentId: scope.parentId, studentName: child.name, status: "PAID" } })
    ]);
    const present = attendance.filter((row) => row.status === "PRESENT").length;
    const scored = results.filter((row) => row.maxMarks > 0);
    const scorePercent = scored.length === 0 ? 0 : scored.reduce((sum, row) => sum + (row.marksObtained / row.maxMarks) * 100, 0) / scored.length;
    return {
      id: `performance-${child.id}`,
      studentName: child.name,
      className: child.className,
      attendanceRate: attendance.length === 0 ? "0%" : `${Math.round((present / attendance.length) * 100)}%`,
      averageScore: `${Math.round(scorePercent)}%`,
      homeworkOpen,
      pendingFees,
      paidPayments
    };
  }));
}

function withSearch(where: any, search: string | undefined, status: string | undefined, resource: Resource) {
  const next = { ...where };
  if (status) {
    if (typeof next.status === "object" && next.status?.not === status) next.status = "__NO_MATCH__";
    else next.status = status;
  }
  if (!search) return next;
  const searchFields: Partial<Record<Resource, string[]>> = {
    attendance: ["studentName", "className", "remarks"],
    results: ["studentName", "className", "subject", "assessment"],
    homework: ["title", "className", "subject"],
    fees: ["title"],
    payments: ["studentName", "feeTitle", "method", "receiptNumber"]
  };
  next.OR = (searchFields[resource] ?? []).map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return next;
}

function filterRows<T extends Record<string, unknown>>(rows: T[], search: string | undefined, status: string | undefined, fields: string[]) {
  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (!search) return true;
    return fields.some((field) => String(row[field] ?? "").toLowerCase().includes(search.toLowerCase()));
  });
}

function orderByFor(resource: Resource) {
  if (resource === "attendance") return { attendanceDate: "desc" };
  if (resource === "results") return { createdAt: "desc" };
  if (resource === "homework") return { dueDate: "asc" };
  if (resource === "fees") return { dueDate: "asc" };
  if (resource === "payments") return { paidOn: "desc" };
  return { createdAt: "desc" };
}

async function ensureOwnRecord(delegate: any, id: string, scope: ParentScope) {
  const found = await delegate.findFirst({ where: { id, schoolId: scope.schoolId, parentId: scope.parentId } });
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

type ParentScope = NonNullable<Awaited<ReturnType<typeof requireParentScope>>>;

export { router as parentRoutes };
