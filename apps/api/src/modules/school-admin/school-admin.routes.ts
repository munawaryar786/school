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


const leaveReviewStatusSchema = z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "CLARIFICATION_REQUESTED"]);
const reviewableLeaveStatuses = ["SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUESTED"];

const leaveReviewSchema = z.object({
  status: leaveReviewStatusSchema,
  reviewerComment: z.string().trim().max(1000).optional().nullable()
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
    const [
      school,
      campuses,
      teachers,
      students,
      parents,
      classes,
      sections,
      subjects,
      admissions,
      attendance,
      libraryBooks,
      fees,
      exams,
      timetable,
      lmsProgress,
      studentsByClass,
      admissionsByStatus,
      attendanceByStatus,
      feeStatusSummary,
      examStatusSummary,
      libraryStatusSummary,
      lmsProgressSummary,
      recentActivity
    ] = await Promise.all([
      prisma.school.findFirst({ where: { id: schoolId, deletedAt: null }, select: { id: true, name: true, slug: true, status: true } }),
      prisma.campus.count({ where: { schoolId } }),
      prisma.teacherProfile.count({ where: { schoolId } }),
      prisma.studentProfile.count({ where: { schoolId } }),
      prisma.schoolMembership.count({ where: { schoolId, role: { code: "PARENT" }, status: "ACTIVE" } }),
      prisma.classLevel.count({ where: { schoolId } }),
      prisma.section.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } }),
      prisma.admissionApplication.count({ where: { schoolId } }),
      prisma.attendanceRecord.count({ where: { schoolId } }),
      prisma.libraryBook.count({ where: { schoolId } }),
      prisma.feeRecord.count({ where: { schoolId } }),
      prisma.examRecord.count({ where: { schoolId } }),
      prisma.timetableSlot.count({ where: { schoolId } }),
      prisma.lmsProgress.count({ where: { schoolId } }),
      prisma.studentProfile.groupBy({ by: ["className"], where: { schoolId }, _count: { _all: true }, orderBy: { className: "asc" } }),
      prisma.admissionApplication.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.attendanceRecord.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.feeRecord.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, _sum: { amount: true }, orderBy: { status: "asc" } }),
      prisma.examRecord.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.libraryBook.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.lmsProgress.groupBy({ by: ["status"], where: { schoolId }, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.auditLog.findMany({
        where: { schoolId },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);
    if (!school) return fail(res, 404, "NOT_FOUND", "School not found.");
    return ok(res, {
      school,
      metrics: { campuses, teachers, students, parents, classes, sections, subjects, admissions, attendance, libraryBooks, fees, exams, timetable, lmsProgress },
      studentsByClass: studentsByClass.map((item) => ({ label: item.className, count: item._count._all })),
      admissionsByStatus: admissionsByStatus.map((item) => ({ status: item.status, count: item._count._all })),
      attendanceByStatus: attendanceByStatus.map((item) => ({ status: item.status, count: item._count._all })),
      feeStatusSummary: feeStatusSummary.map((item) => ({ status: item.status, count: item._count._all, amount: item._sum.amount ?? 0 })),
      examStatusSummary: examStatusSummary.map((item) => ({ status: item.status, count: item._count._all })),
      libraryStatusSummary: libraryStatusSummary.map((item) => ({ status: item.status, count: item._count._all })),
      lmsProgressSummary: lmsProgressSummary.map((item) => ({ status: item.status, count: item._count._all })),
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        action: item.action,
        resource: item.resource,
        resourceId: item.resourceId,
        actorName: item.user?.name ?? null,
        actorEmail: item.user?.email ?? null,
        createdAt: item.createdAt
      })),
      lastUpdatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});


router.get("/leave-requests", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const where: any = { schoolId };
    if (query.status) where.status = query.status;
    const [allRows, total] = await Promise.all([
      (prisma as any).leaveRequest.findMany({
        where,
        include: leaveRequestInclude(),
        orderBy: { createdAt: "desc" }
      }),
      (prisma as any).leaveRequest.count({ where })
    ]);
    const searchedRows = filterLeaveRequests(allRows, query.search);
    const rows = searchedRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    return res.json({
      success: true,
      data: rows.map(serializeLeaveRequest),
      pagination: { page: query.page, pageSize: query.pageSize, total: query.search ? searchedRows.length : total, totalPages: Math.ceil((query.search ? searchedRows.length : total) / query.pageSize) },
      meta: { requestId: res.locals.requestId }
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/leave-requests/:id/review", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const data = leaveReviewSchema.parse(req.body);
    const existing = await (prisma as any).leaveRequest.findFirst({ where: { id: routeId(req), schoolId } });
    if (!existing) return fail(res, 404, "NOT_FOUND", "Leave request not found.");
    if (!reviewableLeaveStatuses.includes(existing.status)) {
      return fail(res, 400, "VALIDATION_ERROR", "This leave request can no longer be reviewed.");
    }
    const row = await (prisma as any).leaveRequest.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        reviewerId: req.auth?.userId,
        reviewerComment: data.reviewerComment || null,
        reviewedAt: new Date(),
        timeline: { create: { actorId: req.auth?.userId, action: data.status, note: data.reviewerComment || null } }
      },
      include: leaveRequestInclude()
    });
    await writeAudit(req, "UPDATE", "leave-requests", row.id, { status: data.status });
    return ok(res, serializeLeaveRequest(row));
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


function leaveRequestInclude() {
  return {
    student: { select: { id: true, admissionNumber: true, name: true, className: true } },
    requestedBy: { select: { id: true, name: true, email: true } },
    reviewer: { select: { id: true, name: true, email: true } },
    timeline: { include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } }
  };
}

function filterLeaveRequests(rows: any[], search: string | undefined) {
  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter((row) => [
    row.student?.name,
    row.student?.admissionNumber,
    row.student?.className,
    row.requestedBy?.name,
    row.requestedBy?.email,
    row.type,
    row.status,
    row.reason
  ].some((value) => String(value ?? "").toLowerCase().includes(needle)));
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
