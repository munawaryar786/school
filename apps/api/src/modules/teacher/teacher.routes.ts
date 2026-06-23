// @ts-nocheck
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
  classes: z.object({
    className: z.string().min(1),
    sectionName: z.string().min(1),
    subject: z.string().min(1),
    room: z.string().optional(),
    schedule: z.string().min(1),
    status: z.string().default("ACTIVE")
  }),
  attendance: z.object({
    studentName: z.string().min(2),
    className: z.string().min(1),
    attendanceDate: z.coerce.date(),
    status: z.string().default("PRESENT"),
    remarks: z.string().optional()
  }),
  assignments: z.object({
    title: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    dueDate: z.coerce.date(),
    maxMarks: z.coerce.number().int().min(1).default(100),
    status: z.string().default("DRAFT")
  }),
  exams: z.object({
    name: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    examDate: z.coerce.date(),
    maxMarks: z.coerce.number().int().min(1).default(100),
    status: z.string().default("SCHEDULED")
  }),
  marks: z.object({
    studentName: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    assessment: z.string().min(2),
    marksObtained: z.coerce.number().int().min(0),
    maxMarks: z.coerce.number().int().min(1).default(100),
    status: z.string().default("RECORDED")
  }),
  materials: z.object({
    title: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    resourceType: z.string().default("LINK"),
    url: z.string().min(2),
    status: z.string().default("PUBLISHED")
  }),
  messages: z.object({
    studentName: z.string().min(2),
    guardianName: z.string().min(2),
    channel: z.string().default("PORTAL"),
    subject: z.string().min(2),
    message: z.string().min(2),
    status: z.string().default("SENT")
  }),
  "online-classes": z.object({
    title: z.string().min(2),
    className: z.string().min(1),
    subject: z.string().min(1),
    startsAt: z.coerce.date(),
    meetingUrl: z.string().min(2),
    status: z.string().default("SCHEDULED")
  })
} as const;

const attendanceStatuses = new Set(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "EXCUSED"]);
const marksEntrySchema = z.object({
  examId: z.string().min(1),
  records: z.array(z.object({
    studentName: z.string().min(2),
    marksObtained: z.coerce.number().int().min(0),
    remarks: z.string().optional()
  })).min(1)
});

type Resource = keyof typeof schemas;

const modelByResource: Record<Resource, keyof typeof prisma> = {
  classes: "teacherClassroom",
  attendance: "teacherAttendance",
  assignments: "teacherAssignment",
  exams: "teacherExamPlan",
  marks: "teacherMark",
  materials: "teacherMaterial",
  messages: "parentCommunication",
  "online-classes": "onlineClass"
};

const columnsByResource: Record<Resource, string[]> = {
  classes: ["id", "className", "sectionName", "subject", "room", "schedule", "status"],
  attendance: ["id", "studentName", "className", "attendanceDate", "status", "remarks"],
  assignments: ["id", "title", "className", "subject", "dueDate", "maxMarks", "status"],
  exams: ["id", "name", "className", "subject", "examDate", "maxMarks", "status"],
  marks: ["id", "studentName", "className", "subject", "assessment", "marksObtained", "maxMarks", "status"],
  materials: ["id", "title", "className", "subject", "resourceType", "url", "status"],
  messages: ["id", "studentName", "guardianName", "channel", "subject", "message", "status"],
  "online-classes": ["id", "title", "className", "subject", "startsAt", "meetingUrl", "status"]
};

router.use(authenticate, requirePermission(PERMISSIONS.TEACHER_OPERATIONS_MANAGE));

router.get("/dashboard", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const assignmentScope = await findTeacherAssignmentScope(scope.schoolId, scope.teacherId);
    const [classes, attendance, assignments, exams, marks, materials, messages, onlineClasses] = await Promise.all([
      prisma.teacherClassroom.count({ where: scope }),
      prisma.teacherAttendance.count({ where: scope }),
      prisma.teacherAssignment.count({ where: scope }),
      prisma.teacherExamPlan.count({ where: scope }),
      prisma.teacherMark.count({ where: scope }),
      prisma.teacherMaterial.count({ where: scope }),
      prisma.parentCommunication.count({ where: scope }),
      prisma.onlineClass.count({ where: scope })
    ]);
    return ok(res, {
      classes: Math.max(classes, assignmentScope.assignmentCount),
      teacherAssignments: assignmentScope.assignmentCount,
      attendance,
      assignments,
      exams,
      marks,
      materials,
      messages,
      onlineClasses,
      profile: assignmentScope.profile
    });
  } catch (error) {
    next(error);
  }
});

router.get("/attendance/context", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const assignmentScope = await findTeacherAssignmentScope(scope.schoolId, scope.teacherId);
    if (!assignmentScope.profile) {
      return ok(res, { profile: null, assignments: [], classes: [], message: "Ask School Admin to assign class before marking attendance." });
    }
    const rows = await (prisma as any).teacherSubjectAssignment.findMany({
      where: { schoolId: scope.schoolId, teacherId: assignmentScope.profile.id, status: "ACTIVE" },
      include: {
        class: { select: { id: true, name: true, code: true, status: true } },
        section: { select: { id: true, name: true, status: true } },
        subject: { select: { id: true, name: true, code: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    const classes = Array.from(new Map(rows.map((row: any) => [row.classId, row.class])).values()).filter(Boolean);
    return ok(res, { profile: assignmentScope.profile, assignments: rows.map(serializeTeacherAssignmentScope), classes });
  } catch (error) {
    next(error);
  }
});

router.get("/attendance/students", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const query = parseAttendanceStudentsQuery(req.query);
    const assignment = await ensureTeacherAssignedClass(scope.schoolId, scope.teacherId, query.classId, query.sectionId || null);
    if (!assignment) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class or section.");
    const students = await prisma.studentProfile.findMany({
      where: { schoolId: scope.schoolId, className: assignment.class.name, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, admissionNumber: true, name: true, className: true, status: true }
    });
    const day = attendanceDayRange(query.date);
    const existing = await prisma.teacherAttendance.findMany({
      where: { schoolId: scope.schoolId, teacherId: scope.teacherId, className: assignment.class.name, attendanceDate: { gte: day.start, lt: day.end } }
    });
    const approvedLeaves = await (prisma as any).leaveRequest.findMany({
      where: { schoolId: scope.schoolId, studentId: { in: students.map((student) => student.id) }, status: "APPROVED", startDate: { lte: day.start }, endDate: { gte: day.start } },
      select: { studentId: true, type: true, reason: true }
    });
    const byName = new Map(existing.map((row: any) => [row.studentName, row]));
    const leaveByStudent = new Map(approvedLeaves.map((row: any) => [row.studentId, row]));
    return ok(res, {
      class: assignment.class,
      section: assignment.section ?? null,
      subject: assignment.subject ?? null,
      date: day.start,
      students: students.map((student) => {
        const attendance = byName.get(student.name);
        const leave = leaveByStudent.get(student.id);
        return {
          ...student,
          attendance: attendance ?? null,
          approvedLeave: leave ?? null,
          suggestedStatus: attendance?.status ?? (leave ? "EXCUSED" : "PRESENT")
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

router.post("/attendance/mark", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const data = parseAttendanceMarkBody(req.body);
    const assignment = await ensureTeacherAssignedClass(scope.schoolId, scope.teacherId, data.classId, data.sectionId || null);
    if (!assignment) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class or section.");
    const day = attendanceDayRange(data.date);
    const students = await prisma.studentProfile.findMany({
      where: { schoolId: scope.schoolId, className: assignment.class.name, status: "ACTIVE" },
      select: { name: true }
    });
    const allowedNames = new Set(students.map((student) => student.name));
    const invalid = data.records.find((record) => !allowedNames.has(record.studentName));
    if (invalid) return fail(res, 403, "FORBIDDEN", "Teacher cannot mark attendance for a student outside the assigned class.");
    const rows = await prisma.$transaction(async (tx) => {
      const saved = [];
      for (const record of data.records) {
        const existing = await tx.teacherAttendance.findFirst({
          where: { schoolId: scope.schoolId, teacherId: scope.teacherId, studentName: record.studentName, className: assignment.class.name, attendanceDate: { gte: day.start, lt: day.end } }
        });
        if (existing) {
          saved.push(await tx.teacherAttendance.update({ where: { id: existing.id }, data: { status: record.status, remarks: record.remarks || null, attendanceDate: day.start } }));
        } else {
          saved.push(await tx.teacherAttendance.create({
            data: { schoolId: scope.schoolId, teacherId: scope.teacherId, studentName: record.studentName, className: assignment.class.name, attendanceDate: day.start, status: record.status, remarks: record.remarks || null }
          }));
        }
      }
      return saved;
    });
    await writeAudit(req, "CREATE", "attendance", "bulk-mark", { classId: data.classId, sectionId: data.sectionId || null, date: day.start.toISOString(), records: rows.length });
    return ok(res, { saved: rows.length, records: rows });
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Attendance could not be saved.");
    next(error);
  }
});

router.get("/exams", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const pairs = await assignedClassSubjectPairs(scope.schoolId, scope.teacherId);
    if (pairs.length === 0) return ok(res, []);
    const rows = await prisma.examinationSchedule.findMany({
      where: { schoolId: scope.schoolId, status: { not: "CANCELLED" }, OR: pairs },
      orderBy: [{ examDate: "asc" }, { title: "asc" }]
    });
    return ok(res, rows);
  } catch (error) {
    next(error);
  }
});

router.get("/exams/:id/students", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const exam = await ensureAssignedExam(scope.schoolId, scope.teacherId, routeId(req));
    if (!exam) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this exam class or subject.");
    const students = await prisma.studentProfile.findMany({
      where: { schoolId: scope.schoolId, className: exam.className, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, admissionNumber: true, name: true, className: true, status: true }
    });
    const marks = await prisma.teacherMark.findMany({ where: { schoolId: scope.schoolId, teacherId: scope.teacherId, className: exam.className, subject: exam.subject, assessment: exam.title } });
    const markByStudent = new Map(marks.map((row: any) => [row.studentName, serializeMark(row)]));
    return ok(res, { exam, students: students.map((student) => ({ ...student, mark: markByStudent.get(student.name) ?? null })) });
  } catch (error) {
    next(error);
  }
});

router.post("/results/marks", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const input = marksEntrySchema.parse(req.body);
    const exam = await ensureAssignedExam(scope.schoolId, scope.teacherId, input.examId);
    if (!exam) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this exam class or subject.");
    const students = await prisma.studentProfile.findMany({ where: { schoolId: scope.schoolId, className: exam.className, status: "ACTIVE" }, select: { name: true } });
    const allowedNames = new Set(students.map((student) => student.name));
    const invalid = input.records.find((record) => !allowedNames.has(record.studentName));
    if (invalid) return fail(res, 403, "FORBIDDEN", "Teacher cannot enter marks for a student outside the assigned class.");
    const tooHigh = input.records.find((record) => record.marksObtained > exam.maxMarks);
    if (tooHigh) return fail(res, 400, "VALIDATION_ERROR", "Marks obtained cannot exceed total marks.");
    const rows = await prisma.$transaction(async (tx) => {
      const saved = [];
      for (const record of input.records) {
        const existing = await tx.teacherMark.findFirst({ where: { schoolId: scope.schoolId, teacherId: scope.teacherId, studentName: record.studentName, className: exam.className, subject: exam.subject, assessment: exam.title } });
        if (existing) {
          saved.push(await tx.teacherMark.update({ where: { id: existing.id }, data: { marksObtained: record.marksObtained, maxMarks: exam.maxMarks, status: "RECORDED" } }));
        } else {
          saved.push(await tx.teacherMark.create({ data: { schoolId: scope.schoolId, teacherId: scope.teacherId, studentName: record.studentName, className: exam.className, subject: exam.subject, assessment: exam.title, marksObtained: record.marksObtained, maxMarks: exam.maxMarks, status: "RECORDED" } }));
        }
      }
      return saved;
    });
    await writeAudit(req, "CREATE", "marks", input.examId, { records: rows.length, className: exam.className, subject: exam.subject });
    return ok(res, { saved: rows.length, records: rows.map(serializeMark) });
  } catch (error) {
    next(error);
  }
});
router.get("/timetable", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const assignmentScope = await findTeacherAssignmentScope(scope.schoolId, scope.teacherId);
    if (!assignmentScope.profile) return ok(res, []);
    const rows = await prisma.timetableSlot.findMany({
      where: { schoolId: scope.schoolId, teacher: assignmentScope.profile.name, status: "ACTIVE" },
      orderBy: [{ dayOfWeek: "asc" }, { startsAt: "asc" }]
    });
    return ok(res, rows);
  } catch (error) {
    next(error);
  }
});
router.get("/homework", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const query = pageQuerySchema.parse(req.query);
    const where = buildWhere("assignments", scope, query.search, query.status);
    const [rows, total] = await Promise.all([
      prisma.teacherAssignment.findMany({ where, orderBy: { dueDate: "asc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.teacherAssignment.count({ where })
    ]);
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/homework", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const data = schemas.assignments.parse(req.body);
    const allowed = await isAssignedClassSubject(scope.schoolId, scope.teacherId, data.className, data.subject);
    if (!allowed) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class and subject.");
    const row = await prisma.teacherAssignment.create({ data: { ...data, ...scope } });
    await writeAudit(req, "CREATE", "homework", row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Homework could not be saved.");
    next(error);
  }
});

router.patch("/homework/:id", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    await ensureOwnRecord(prisma.teacherAssignment, routeId(req), scope);
    const data = schemas.assignments.partial().parse(req.body);
    if ((data.className || data.subject) && !(await canUpdateAssignedRow(scope.schoolId, scope.teacherId, routeId(req), data, "assignment"))) {
      return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class and subject.");
    }
    const row = await prisma.teacherAssignment.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", "homework", row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    next(error);
  }
});

router.get("/lms", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const query = pageQuerySchema.parse(req.query);
    const where = buildWhere("materials", scope, query.search, query.status);
    const [rows, total] = await Promise.all([
      prisma.teacherMaterial.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.teacherMaterial.count({ where })
    ]);
    return paginated(res, rows, query.page, query.pageSize, total);
  } catch (error) {
    next(error);
  }
});

router.post("/lms", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    const data = schemas.materials.parse(req.body);
    const allowed = await isAssignedClassSubject(scope.schoolId, scope.teacherId, data.className, data.subject);
    if (!allowed) return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class and subject.");
    const row = await prisma.teacherMaterial.create({ data: { ...data, ...scope } });
    await writeAudit(req, "CREATE", "lms", row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Learning material could not be saved.");
    next(error);
  }
});

router.patch("/lms/:id", async (req, res, next) => {
  try {
    const scope = requireTeacherScope(req, res);
    if (!scope) return;
    await ensureOwnRecord(prisma.teacherMaterial, routeId(req), scope);
    const data = schemas.materials.partial().parse(req.body);
    if ((data.className || data.subject) && !(await canUpdateAssignedRow(scope.schoolId, scope.teacherId, routeId(req), data, "material"))) {
      return fail(res, 403, "FORBIDDEN", "Teacher is not assigned to this class and subject.");
    }
    const row = await prisma.teacherMaterial.update({ where: { id: routeId(req) }, data });
    await writeAudit(req, "UPDATE", "lms", row.id, data as Record<string, unknown>);
    return ok(res, row);
  } catch (error) {
    next(error);
  }
});
router.get("/:resource", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const scope = requireTeacherScope(req, res);
    if (!resource || !scope) return;
    const query = pageQuerySchema.parse(req.query);
    const delegate = prisma[modelByResource[resource]] as any;
    const where = buildWhere(resource, scope, query.search, query.status);
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
    const scope = requireTeacherScope(req, res);
    if (!resource || !scope) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].parse(req.body);
    const row = await delegate.create({ data: { ...data, ...scope } });
    await writeAudit(req, "CREATE", resource, row.id, data as Record<string, unknown>);
    return ok(res, row, 201);
  } catch (error) {
    if (isPrismaError(error)) return fail(res, 409, "CONFLICT", "Teacher record could not be saved.");
    next(error);
  }
});

router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const resource = parseResource(req, res);
    const scope = requireTeacherScope(req, res);
    if (!resource || !scope) return;
    const delegate = prisma[modelByResource[resource]] as any;
    const data = schemas[resource].partial().parse(req.body);
    await ensureOwnRecord(delegate, routeId(req), scope);
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
    const scope = requireTeacherScope(req, res);
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

function parseResource(req: Request, res: Response): Resource | null {
  const resource = req.params.resource as Resource;
  if (!resource || !(resource in schemas)) {
    fail(res, 404, "NOT_FOUND", "Teacher resource not found.");
    return null;
  }
  return resource;
}

function requireTeacherScope(req: Request, res: Response) {
  if (!req.auth?.schoolId) {
    fail(res, 403, "TENANT_REQUIRED", "A school context is required.");
    return null;
  }
  if (!req.auth.userId) {
    fail(res, 401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    return null;
  }
  return { schoolId: req.auth.schoolId, teacherId: req.auth.userId };
}

function buildWhere(resource: Resource, scope: { schoolId: string; teacherId: string }, search?: string, status?: string) {
  const where: any = { ...scope };
  if (status) where.status = status;
  if (!search) return where;
  const searchFields: Record<Resource, string[]> = {
    classes: ["className", "sectionName", "subject", "room", "schedule"],
    attendance: ["studentName", "className", "remarks"],
    assignments: ["title", "className", "subject"],
    exams: ["name", "className", "subject"],
    marks: ["studentName", "className", "subject", "assessment"],
    materials: ["title", "className", "subject", "resourceType", "url"],
    messages: ["studentName", "guardianName", "channel", "subject", "message"],
    "online-classes": ["title", "className", "subject", "meetingUrl"]
  };
  where.OR = searchFields[resource].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  return where;
}

async function findTeacherAssignmentScope(schoolId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (!user?.email) return { assignmentCount: 0, profile: null };
  const profile = await prisma.teacherProfile.findFirst({
    where: { schoolId, email: user.email },
    select: { id: true, employeeNumber: true, name: true, email: true, phone: true, specialization: true, status: true }
  });
  if (!profile) return { assignmentCount: 0, profile: null };
  let assignmentCount = 0;
  try {
    assignmentCount = await (prisma as any).teacherSubjectAssignment.count({
      where: { schoolId, teacherId: profile.id }
    });
  } catch (error) {
    if (!isMissingTeacherAssignmentTable(error)) throw error;
  }
  return { assignmentCount, profile };
}

async function assignedClassSubjectPairs(schoolId: string, userId: string) {
  const assignmentScope = await findTeacherAssignmentScope(schoolId, userId);
  if (!assignmentScope.profile) return [];
  const assignments = await (prisma as any).teacherSubjectAssignment.findMany({
    where: { schoolId, teacherId: assignmentScope.profile.id, status: "ACTIVE" },
    include: { class: { select: { name: true } }, subject: { select: { name: true } } }
  });
  return assignments.filter((row: any) => row.class?.name && row.subject?.name).map((row: any) => ({ className: row.class.name, subject: row.subject.name }));
}

async function isAssignedClassSubject(schoolId: string, userId: string, className: string, subject: string) {
  const pairs = await assignedClassSubjectPairs(schoolId, userId);
  return pairs.some((pair: any) => pair.className === className && pair.subject === subject);
}

async function canUpdateAssignedRow(schoolId: string, userId: string, id: string, data: any, kind: "assignment" | "material") {
  const current = kind === "assignment"
    ? await prisma.teacherAssignment.findFirst({ where: { id, schoolId, teacherId: userId } })
    : await prisma.teacherMaterial.findFirst({ where: { id, schoolId, teacherId: userId } });
  if (!current) return false;
  return isAssignedClassSubject(schoolId, userId, data.className ?? current.className, data.subject ?? current.subject);
}
async function ensureAssignedExam(schoolId: string, userId: string, examId: string) {
  const pairs = await assignedClassSubjectPairs(schoolId, userId);
  if (pairs.length === 0) return null;
  return prisma.examinationSchedule.findFirst({ where: { id: examId, schoolId, OR: pairs } });
}

function serializeMark(row: any) {
  const percentage = row.maxMarks > 0 ? Math.round((row.marksObtained / row.maxMarks) * 100) : null;
  return { ...row, percentage, grade: gradeForPercentage(percentage) };
}

function gradeForPercentage(value: number | null) {
  if (value == null) return null;
  if (value >= 90) return "A+";
  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  return "F";
}
async function ensureTeacherAssignedClass(schoolId: string, userId: string, classId: string, sectionId: string | null) {
  const assignmentScope = await findTeacherAssignmentScope(schoolId, userId);
  if (!assignmentScope.profile) return null;
  const where: any = { schoolId, teacherId: assignmentScope.profile.id, classId, status: "ACTIVE" };
  if (sectionId) where.OR = [{ sectionId }, { sectionId: null }];
  const assignment = await (prisma as any).teacherSubjectAssignment.findFirst({
    where,
    include: {
      class: { select: { id: true, name: true, code: true, status: true } },
      section: { select: { id: true, name: true, status: true } },
      subject: { select: { id: true, name: true, code: true, status: true } }
    }
  });
  return assignment;
}

function serializeTeacherAssignmentScope(row: any) {
  return {
    id: row.id,
    classId: row.classId,
    sectionId: row.sectionId,
    subjectId: row.subjectId,
    status: row.status,
    class: row.class ?? null,
    section: row.section ?? null,
    subject: row.subject ?? null
  };
}

function attendanceDayRange(value: Date) {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function parseAttendanceStudentsQuery(query: any) {
  const classId = String(query.classId ?? "").trim();
  if (!classId) throw Object.assign(new Error("Class is required."), { statusCode: 400 });
  const date = new Date(query.date ?? new Date());
  if (Number.isNaN(date.getTime())) throw Object.assign(new Error("Valid attendance date is required."), { statusCode: 400 });
  return { classId, sectionId: String(query.sectionId ?? "").trim(), date };
}

function parseAttendanceMarkBody(body: any) {
  const classId = String(body?.classId ?? "").trim();
  if (!classId) throw Object.assign(new Error("Class is required."), { statusCode: 400 });
  const date = new Date(body?.date ?? new Date());
  if (Number.isNaN(date.getTime())) throw Object.assign(new Error("Valid attendance date is required."), { statusCode: 400 });
  const records = Array.isArray(body?.records) ? body.records : [];
  if (records.length === 0) throw Object.assign(new Error("At least one attendance record is required."), { statusCode: 400 });
  return {
    classId,
    sectionId: body?.sectionId ? String(body.sectionId).trim() : null,
    date,
    records: records.map((record: any) => {
      const studentName = String(record?.studentName ?? "").trim();
      const status = String(record?.status ?? "PRESENT").trim();
      if (studentName.length < 2) throw Object.assign(new Error("Student name is required."), { statusCode: 400 });
      if (!attendanceStatuses.has(status)) throw Object.assign(new Error("Invalid attendance status."), { statusCode: 400 });
      return { studentName, status, remarks: record?.remarks ? String(record.remarks).trim().slice(0, 500) : null };
    })
  };
}

async function ensureOwnRecord(delegate: any, id: string, scope: { schoolId: string; teacherId: string }) {
  const found = await delegate.findFirst({ where: { id, ...scope } });
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

function isMissingTeacherAssignmentTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
}

async function writeAudit(req: Request, action: Parameters<AuditService["record"]>[0]["action"], resource: string, resourceId: string, metadata: Record<string, unknown>) {
  await audit.record({ userId: req.auth?.userId, schoolId: req.auth?.schoolId, action, resource, resourceId, metadata, ipAddress: req.ip, userAgent: req.header("user-agent") });
}

export { router as teacherRoutes };

