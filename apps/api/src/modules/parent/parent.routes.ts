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

const leaveRequestTypeSchema = z.enum([
  "FULL_DAY",
  "MULTI_DAY",
  "HALF_DAY",
  "LATE_ARRIVAL",
  "EARLY_PICKUP",
  "MEDICAL_APPOINTMENT",
  "EMERGENCY",
  "FAMILY",
  "OTHER"
]);

const leaveRequestStatusValues = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLARIFICATION_REQUESTED", "CANCELLED"] as const;

const createLeaveRequestSchema = z.object({
  type: leaveRequestTypeSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startTime: z.string().trim().max(20).optional().nullable(),
  endTime: z.string().trim().max(20).optional().nullable(),
  reason: z.string().trim().min(3).max(1000),
  parentNote: z.string().trim().max(1000).optional().nullable()
}).refine((value) => value.endDate >= value.startDate, {
  message: "End date must be on or after the start date.",
  path: ["endDate"]
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
    const [attendance, results, homework, fees, payments, inboundMessages, outboundMessages, leaveRequests] = await Promise.all([
      prisma.teacherAttendance.count({ where: whereFor("attendance", scope) }),
      prisma.teacherMark.count({ where: whereFor("results", scope) }),
      prisma.teacherAssignment.count({ where: whereFor("homework", scope) }),
      prisma.feeRecord.count({ where: whereFor("fees", scope) }),
      prisma.parentFeePayment.count({ where: whereFor("payments", scope) }),
      prisma.parentCommunication.count({ where: inboundCommunicationWhere(scope) }),
      prisma.parentPortalMessage.count({ where: whereFor("communication", scope) }),
      (prisma as any).leaveRequest.count({ where: { schoolId: scope.schoolId, requestedById: scope.parentId } })
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
      leaveRequests,
      childProfiles: scope.children.map(serializeChild),
      performanceSummary: performance
    });
  } catch (error) {
    next(error);
  }
});

router.get("/children", async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    return ok(res, scope.children.map(serializeChild));
  } catch (error) {
    next(error);
  }
});

router.get("/children/:studentId/summary", async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    const child = ensureLinkedChild(req, res, scope);
    if (!child) return;
    const [attendance, results, homework, pendingFees, paidPayments, inboundMessages, outboundMessages, leaveRequests] = await Promise.all([
      prisma.teacherAttendance.findMany({ where: { schoolId: scope.schoolId, studentName: child.name } }),
      prisma.teacherMark.findMany({ where: { schoolId: scope.schoolId, studentName: child.name } }),
      prisma.teacherAssignment.count({ where: { schoolId: scope.schoolId, className: child.className, status: "PUBLISHED" } }),
      prisma.feeRecord.count({ where: { schoolId: scope.schoolId, status: { in: ["PENDING", "OVERDUE"] } } }),
      prisma.parentFeePayment.count({ where: { schoolId: scope.schoolId, parentId: scope.parentId, studentName: child.name, status: "PAID" } }),
      prisma.parentCommunication.count({ where: { schoolId: scope.schoolId, guardianName: scope.parentName, studentName: child.name } }),
      prisma.parentPortalMessage.count({ where: { schoolId: scope.schoolId, parentId: scope.parentId, studentName: child.name } }),
      (prisma as any).leaveRequest.findMany({ where: { schoolId: scope.schoolId, studentId: child.id, requestedById: scope.parentId }, orderBy: { createdAt: "desc" } })
    ]);
    const present = attendance.filter((row) => row.status === "PRESENT").length;
    const attendanceRate = attendance.length === 0 ? null : Math.round((present / attendance.length) * 100);
    const scored = results.filter((row) => row.maxMarks > 0);
    const averageScore = scored.length === 0 ? null : Math.round(scored.reduce((sum, row) => sum + (row.marksObtained / row.maxMarks) * 100, 0) / scored.length);
    return ok(res, {
      child: serializeChild(child),
      attendance: { total: attendance.length, present, attendanceRate },
      results: { total: results.length, averageScore },
      homework: { open: homework },
      fees: { pending: pendingFees, paidPayments },
      messages: { total: inboundMessages + outboundMessages },
      leaveRequests: {
        total: leaveRequests.length,
        pending: leaveRequests.filter((row: any) => ["SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUESTED"].includes(row.status)).length,
        latest: leaveRequests[0] ? serializeLeaveRequest(leaveRequests[0]) : null,
        byStatus: leaveRequestStatusValues.map((status) => ({ status, count: leaveRequests.filter((row: any) => row.status === status).length }))
      },
      library: { available: false, message: "Library reading data is not configured yet." }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/children/:studentId/leave-requests", async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    const child = ensureLinkedChild(req, res, scope);
    if (!child) return;
    const rows = await (prisma as any).leaveRequest.findMany({
      where: { schoolId: scope.schoolId, studentId: child.id, requestedById: scope.parentId },
      include: leaveRequestInclude(),
      orderBy: { createdAt: "desc" }
    });
    return ok(res, rows.map(serializeLeaveRequest));
  } catch (error) {
    next(error);
  }
});

router.post("/children/:studentId/leave-requests", async (req, res, next) => {
  try {
    const scope = await requireParentScope(req, res);
    if (!scope) return;
    const child = ensureLinkedChild(req, res, scope);
    if (!child) return;
    const data = createLeaveRequestSchema.parse(req.body);
    const row = await (prisma as any).leaveRequest.create({
      data: {
        schoolId: scope.schoolId,
        studentId: child.id,
        requestedById: scope.parentId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        reason: data.reason,
        parentNote: data.parentNote || null,
        timeline: { create: { actorId: scope.parentId, action: "SUBMITTED", note: data.parentNote || null } }
      },
      include: leaveRequestInclude()
    });
    await writeAudit(req, "CREATE", "leave-requests", row.id, { studentId: child.id, type: data.type });
    return ok(res, serializeLeaveRequest(row), 201);
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

function ensureLinkedChild(req: Request, res: Response, scope: ParentScope) {
  const studentId = routeParam(req, "studentId");
  const child = scope.children.find((item) => item.id === studentId);
  if (!child) {
    fail(res, 403, "FORBIDDEN", "This child is not linked to the parent account.");
    return null;
  }
  return child;
}

function serializeChild(child: ParentScope["children"][number]) {
  return {
    id: child.id,
    admissionNumber: child.admissionNumber,
    name: child.name,
    guardianName: child.guardianName,
    guardianPhone: child.guardianPhone,
    className: child.className,
    status: child.status,
    createdAt: child.createdAt,
    updatedAt: child.updatedAt
  };
}

function leaveRequestInclude() {
  return {
    student: { select: { id: true, admissionNumber: true, name: true, className: true } },
    requestedBy: { select: { id: true, name: true, email: true } },
    reviewer: { select: { id: true, name: true, email: true } },
    timeline: { include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } }
  };
}

function serializeLeaveRequest(row: any) {
  return {
    id: row.id,
    schoolId: row.schoolId,
    studentId: row.studentId,
    student: row.student ?? null,
    requestedById: row.requestedById,
    requestedBy: row.requestedBy ?? null,
    type: row.type,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    startTime: row.startTime,
    endTime: row.endTime,
    reason: row.reason,
    parentNote: row.parentNote,
    reviewerId: row.reviewerId,
    reviewer: row.reviewer ?? null,
    reviewerComment: row.reviewerComment,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    timeline: Array.isArray(row.timeline) ? row.timeline.map((event: any) => ({
      id: event.id,
      action: event.action,
      note: event.note,
      actorId: event.actorId,
      actor: event.actor ?? null,
      createdAt: event.createdAt
    })) : []
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

function routeParam(req: Request, key: string) {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

function isPrismaError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

type ParentScope = NonNullable<Awaited<ReturnType<typeof requireParentScope>>>;

export { router as parentRoutes };
