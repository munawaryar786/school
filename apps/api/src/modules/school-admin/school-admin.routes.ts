// @ts-nocheck
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PERMISSIONS } from "@school-erp/shared";
import { prisma } from "../../db/prisma";
import { ok, fail } from "../../http/responses";
import { authenticate, requirePermission } from "../auth/auth.middleware";
import { AuditService } from "../audit/audit.service";
import { buildSchoolReadiness } from "./school-admin.readiness";

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

const relationTypeSchema = z.enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"]);

const parentCreateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  loginEnabled: z.boolean().default(false),
  studentId: z.string().trim().min(1).optional(),
  relationType: relationTypeSchema.default("GUARDIAN"),
  isEmergencyContact: z.boolean().default(false)
});

const parentUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  loginEnabled: z.boolean().optional()
});

const parentLinkSchema = z.object({
  studentId: z.string().trim().min(1),
  relationType: relationTypeSchema.default("GUARDIAN"),
  isEmergencyContact: z.boolean().default(false),
  canLogin: z.boolean().default(true),
  status: z.string().trim().min(1).default("ACTIVE")
});

const parentLoginStatusSchema = z.object({
  loginEnabled: z.boolean()
});

const teacherAssignmentSchema = z.object({
  teacherId: z.string().trim().min(1),
  classId: z.string().trim().min(1),
  sectionId: z.string().trim().min(1).optional().nullable(),
  subjectId: z.string().trim().min(1),
  status: z.string().trim().min(1).default("ACTIVE")
});

type Resource =
  | "academic-years"
  | "classes"
  | "sections"
  | "subjects"
  | "teachers"
  | "students"
  | "fees"
  | "exams"
  | "attendance"
  | "library"
  | "timetable"
  | "teacher-assignments";

const schemas: Record<Resource, z.ZodTypeAny> = {
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
  timetable: z.object({ className: z.string().min(1), subject: z.string().min(1), teacher: z.string().min(1), dayOfWeek: z.string().min(1), startsAt: z.string().min(1), endsAt: z.string().min(1), status: z.string().default("ACTIVE") }),
  "teacher-assignments": teacherAssignmentSchema
} as const;

const explicitCrudResources = ["academic-years", "classes", "sections", "subjects", "students", "teachers", "teacher-assignments"] as const satisfies readonly Resource[];

const modelByResource: Record<Resource, string> = {
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
  timetable: "timetableSlot",
  "teacher-assignments": "teacherSubjectAssignment"
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
  timetable: ["id", "className", "subject", "teacher", "dayOfWeek", "startsAt", "endsAt", "status"],
  "teacher-assignments": ["id", "teacherId", "classId", "sectionId", "subjectId", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.SCHOOL_OPERATIONS_MANAGE));

for (const resource of explicitCrudResources) {
  router.get(`/${resource}`, (req, res, next) => listSchoolResource(req, res, next, resource));
  router.post(`/${resource}`, (req, res, next) => createSchoolResource(req, res, next, resource));
  router.patch(`/${resource}/:id`, (req, res, next) => updateSchoolResource(req, res, next, resource));
}

router.get("/readiness", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    return ok(res, await buildSchoolReadiness(schoolId));
  } catch (error) {
    next(error);
  }
});

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

router.get("/parents", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const where: any = {
      schoolId,
      role: { code: "PARENT" },
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.search ? {
        OR: [
          { user: { name: { contains: query.search, mode: "insensitive" } } },
          { user: { email: { contains: query.search, mode: "insensitive" } } }
        ]
      } : {})
    };
    const [rows, total] = await Promise.all([
      listParentMemberships(where, schoolId, query.page, query.pageSize),
      prisma.schoolMembership.count({ where })
    ]);
    return paginated(res, rows.map(serializeParentMembership), query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/parents", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const data = parentCreateSchema.parse(req.body);
    const role = await prisma.role.findUnique({ where: { code: "PARENT" } });
    if (!role) return fail(res, 500, "VALIDATION_ERROR", "Parent role is not configured.");
    if (data.studentId) {
      const student = await prisma.studentProfile.findFirst({ where: { id: data.studentId, schoolId } });
      if (!student) return fail(res, 404, "NOT_FOUND", "Student not found for this school.");
    }
    const row = await prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("base64url"), 12);
      const user = await tx.user.upsert({
        where: { email: data.email },
        update: { name: data.name, isActive: data.loginEnabled },
        create: { email: data.email, name: data.name, passwordHash, isActive: data.loginEnabled }
      });
      const membership = await tx.schoolMembership.upsert({
        where: { userId_schoolId_roleId: { userId: user.id, schoolId, roleId: role.id } },
        update: { status: data.loginEnabled ? "ACTIVE" : "INVITED" },
        create: { userId: user.id, schoolId, roleId: role.id, status: data.loginEnabled ? "ACTIVE" : "INVITED" }
      });
      if (data.studentId) {
        try {
          await tx.guardianStudentLink.upsert({
            where: { schoolId_parentUserId_studentId: { schoolId, parentUserId: user.id, studentId: data.studentId } },
            update: { relationType: data.relationType, isEmergencyContact: data.isEmergencyContact, canLogin: data.loginEnabled, status: "ACTIVE" },
            create: { schoolId, parentUserId: user.id, studentId: data.studentId, relationType: data.relationType, isEmergencyContact: data.isEmergencyContact, canLogin: data.loginEnabled }
          });
        } catch (error) {
          if (isMissingTableError(error)) {
            throw Object.assign(new Error("Guardian links require the pending Phase 32D migration before parent-child linking can be used."), { statusCode: 503, code: "MIGRATION_REQUIRED" });
          }
          throw error;
        }
      }
      return tx.schoolMembership.findUniqueOrThrow({ where: { id: membership.id }, include: { user: true } });
    });
    await writeAudit(req, "CREATE", "parents", row.userId, { email: data.email, studentId: data.studentId ?? null });
    return ok(res, serializeParentMembership(row), 201);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "A parent account with this email or link already exists.");
    if (isMigrationRequiredError(error)) return fail(res, 503, "INTERNAL_ERROR", error.message);
    next(error);
  }
});

router.patch("/parents/:parentId", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const parentId = routeParam(req, "parentId");
    const data = parentUpdateSchema.parse(req.body);
    const membership = await prisma.schoolMembership.findFirst({
      where: { schoolId, userId: parentId, role: { code: "PARENT" } },
      include: { user: true }
    });
    if (!membership) return fail(res, 404, "NOT_FOUND", "Parent account not found for this school.");
    const user = await prisma.user.update({
      where: { id: parentId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(typeof data.loginEnabled === "boolean" ? { isActive: data.loginEnabled } : {})
      },
      select: { id: true, name: true, email: true, isActive: true }
    });
    if (typeof data.loginEnabled === "boolean") {
      await prisma.$transaction([
        prisma.schoolMembership.update({ where: { id: membership.id }, data: { status: data.loginEnabled ? "ACTIVE" : "SUSPENDED" } }),
        prisma.guardianStudentLink.updateMany({ where: { schoolId, parentUserId: parentId }, data: { canLogin: data.loginEnabled } })
      ]);
    }
    const updatedMembership = { ...membership, status: typeof data.loginEnabled === "boolean" ? (data.loginEnabled ? "ACTIVE" : "SUSPENDED") : membership.status, user };
    await writeAudit(req, "UPDATE", "parents", parentId, data as Record<string, unknown>);
    return ok(res, serializeParentMembership(updatedMembership));
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "A parent account with this email already exists.");
    next(error);
  }
});

router.post("/parents/:parentId/link-child", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const parentId = routeParam(req, "parentId");
    const data = parentLinkSchema.parse(req.body);
    const [membership, student] = await Promise.all([
      prisma.schoolMembership.findFirst({ where: { schoolId, userId: parentId, role: { code: "PARENT" } } }),
      prisma.studentProfile.findFirst({ where: { schoolId, id: data.studentId } })
    ]);
    if (!membership) return fail(res, 404, "NOT_FOUND", "Parent account not found for this school.");
    if (!student) return fail(res, 404, "NOT_FOUND", "Student not found for this school.");
    const row = await prisma.guardianStudentLink.upsert({
      where: { schoolId_parentUserId_studentId: { schoolId, parentUserId: parentId, studentId: data.studentId } },
      update: { relationType: data.relationType, isEmergencyContact: data.isEmergencyContact, canLogin: data.canLogin, status: data.status },
      create: { schoolId, parentUserId: parentId, studentId: data.studentId, relationType: data.relationType, isEmergencyContact: data.isEmergencyContact, canLogin: data.canLogin, status: data.status },
      include: { student: { select: { id: true, admissionNumber: true, name: true, className: true, status: true } } }
    });
    await writeAudit(req, "CREATE", "guardian-student-links", row.id, { parentId, studentId: data.studentId });
    return ok(res, row, 201);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "This child is already linked to the parent.");
    if (isMissingTableError(error)) return fail(res, 503, "INTERNAL_ERROR", "Guardian links require the pending Phase 32D migration before parent-child linking can be used.");
    next(error);
  }
});

router.patch("/parents/:parentId/login-status", async (req, res, next) => {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const parentId = routeParam(req, "parentId");
    const data = parentLoginStatusSchema.parse(req.body);
    const membership = await prisma.schoolMembership.findFirst({ where: { schoolId, userId: parentId, role: { code: "PARENT" } } });
    if (!membership) return fail(res, 404, "NOT_FOUND", "Parent account not found for this school.");
    await prisma.$transaction([
      prisma.user.update({ where: { id: parentId }, data: { isActive: data.loginEnabled } }),
      prisma.schoolMembership.update({ where: { id: membership.id }, data: { status: data.loginEnabled ? "ACTIVE" : "SUSPENDED" } }),
      prisma.guardianStudentLink.updateMany({ where: { schoolId, parentUserId: parentId }, data: { canLogin: data.loginEnabled } })
    ]);
    await writeAudit(req, "UPDATE", "parents", parentId, { loginEnabled: data.loginEnabled });
    return ok(res, { parentId, loginEnabled: data.loginEnabled });
  } catch (error) {
    next(error);
  }
});

router.get("/:resource", (req, res, next) => {
  const resource = parseResource(req, res);
  if (!resource) return;
  return listSchoolResource(req, res, next, resource);
});

router.post("/:resource", (req, res, next) => {
  const resource = parseResource(req, res);
  if (!resource) return;
  return createSchoolResource(req, res, next, resource);
});

router.patch("/:resource/:id", (req, res, next) => {
  const resource = parseResource(req, res);
  if (!resource) return;
  return updateSchoolResource(req, res, next, resource);
});

async function listSchoolResource(req: Request, res: Response, next: (error?: unknown) => void, resource: Resource) {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = prismaDelegate(resource);
    const where = buildWhere(resource, schoolId, query.search, query.status);
    const [rows, total] = await Promise.all([
      delegate.findMany({ where, ...includeFor(resource), orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      delegate.count({ where })
    ]);
    if (query.format === "csv") {
      await writeAudit(req, "EXPORT", resource, "csv", { search: query.search, status: query.status });
      return csv(res, `${resource}.csv`, rows, columnsByResource[resource]);
    }
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    if (resource === "teacher-assignments" && isMissingTableError(error)) {
      return paginated(res, [], 1, pageQuerySchema.parse(req.query).pageSize, 0);
    }
    next(error);
  }
}

async function createSchoolResource(req: Request, res: Response, next: (error?: unknown) => void, resource: Resource) {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const delegate = prismaDelegate(resource);
    const data = schemas[resource].parse(req.body) as Record<string, any>;
    const guard = await validateSchoolReferences(resource, schoolId, data);
    if (guard) return guard(res);
    if (resource === "academic-years" && data.status === "ACTIVE") {
      const row = await prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({ where: { schoolId, status: "ACTIVE" }, data: { status: "INACTIVE" } });
        return tx.academicYear.create({ data: { ...data, schoolId } });
      });
      await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
      return ok(res, row, 201);
    }
    const row = await delegate.create({ data: { ...data, schoolId } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isUniqueError(error)) return fail(res, 409, "CONFLICT", "A record with this unique value already exists.");
    if (resource === "teacher-assignments" && isMissingTableError(error)) return fail(res, 503, "INTERNAL_ERROR", "Teacher assignments require the pending Phase 32D migration before this workflow can be used.");
    next(error);
  }
}

async function updateSchoolResource(req: Request, res: Response, next: (error?: unknown) => void, resource: Resource) {
  try {
    const schoolId = requireSchool(req, res);
    if (!schoolId) return;
    const delegate = prismaDelegate(resource);
    const data = (schemas[resource] as any).partial().parse(req.body) as Record<string, any>;
    await ensureOwnRecord(delegate, routeId(req), schoolId);
    const guard = await validateSchoolReferences(resource, schoolId, data);
    if (guard) return guard(res);
    if (resource === "academic-years" && data.status === "ACTIVE") {
      const row = await prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({ where: { schoolId, status: "ACTIVE", id: { not: routeId(req) } }, data: { status: "INACTIVE" } });
        return tx.academicYear.update({ where: { id: routeId(req) }, data });
      });
      await writeAudit(req, "UPDATE", resource, row.id, data as Record<string, unknown>);
      return ok(res, row);
    }
    const row = await delegate.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    if (resource === "teacher-assignments" && isMissingTableError(error)) return fail(res, 503, "INTERNAL_ERROR", "Teacher assignments require the pending Phase 32D migration before this workflow can be used.");
    next(error);
  }
}

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const schoolId = requireSchool(req, res);
    if (!resource || !schoolId) return;
    const delegate = prismaDelegate(resource);
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

function serializeParentMembership(row: any) {
  return {
    id: row.user.id,
    membershipId: row.id,
    name: row.user.name,
    email: row.user.email,
    loginEnabled: Boolean(row.user.isActive && row.status === "ACTIVE"),
    membershipStatus: row.status,
    links: Array.isArray(row.user.guardianStudentLinks) ? row.user.guardianStudentLinks.map((link: any) => ({
      id: link.id,
      relationType: link.relationType,
      isEmergencyContact: link.isEmergencyContact,
      canLogin: link.canLogin,
      status: link.status,
      student: link.student ?? null
    })) : []
  };
}

async function listParentMemberships(where: any, schoolId: string, page: number, pageSize: number) {
  try {
    return await prisma.schoolMembership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            guardianStudentLinks: {
              where: { schoolId },
              include: { student: { select: { id: true, admissionNumber: true, name: true, className: true, status: true } } },
              orderBy: { createdAt: "desc" }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    return prisma.schoolMembership.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }
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
    timetable: ["className", "subject", "teacher", "dayOfWeek"],
    "teacher-assignments": ["status"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

function includeFor(resource: Resource) {
  if (resource === "sections") return { include: { class: { select: { id: true, name: true, code: true } } } };
  if (resource === "teacher-assignments") {
    return {
      include: {
        teacher: { select: { id: true, employeeNumber: true, name: true, email: true } },
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    };
  }
  return {};
}

function prismaDelegate(resource: Resource) {
  return (prisma as any)[modelByResource[resource]];
}

async function validateSchoolReferences(resource: Resource, schoolId: string, data: Record<string, unknown>) {
  if (resource === "sections" && typeof data.classId === "string") {
    const found = await prisma.classLevel.findFirst({ where: { id: data.classId, schoolId } });
    if (!found) return (res: Response) => fail(res, 404, "NOT_FOUND", "Class not found for this school.");
  }
  if (resource === "teacher-assignments") {
    const [teacher, classLevel, subject, section] = await Promise.all([
      typeof data.teacherId === "string" ? prisma.teacherProfile.findFirst({ where: { id: data.teacherId, schoolId } }) : Promise.resolve(true),
      typeof data.classId === "string" ? prisma.classLevel.findFirst({ where: { id: data.classId, schoolId } }) : Promise.resolve(true),
      typeof data.subjectId === "string" ? prisma.subject.findFirst({ where: { id: data.subjectId, schoolId } }) : Promise.resolve(true),
      typeof data.sectionId === "string" ? prisma.section.findFirst({ where: { id: data.sectionId, schoolId, ...(typeof data.classId === "string" ? { classId: data.classId } : {}) } }) : Promise.resolve(true)
    ]);
    if (!teacher) return (res: Response) => fail(res, 404, "NOT_FOUND", "Teacher not found for this school.");
    if (!classLevel) return (res: Response) => fail(res, 404, "NOT_FOUND", "Class not found for this school.");
    if (!subject) return (res: Response) => fail(res, 404, "NOT_FOUND", "Subject not found for this school.");
    if (!section) return (res: Response) => fail(res, 404, "NOT_FOUND", "Section not found for this school/class.");
  }
  return null;
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

function routeParam(req: Request, key: string) {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isMissingTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
}

function isMigrationRequiredError(error: unknown): error is Error {
  return error instanceof Error && (error as any).code === "MIGRATION_REQUIRED";
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as schoolAdminRoutes };
