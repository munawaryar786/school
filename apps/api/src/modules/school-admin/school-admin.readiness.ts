import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";

type Dependency = [string, boolean];

type ModuleRule = {
  label: string;
  ready: boolean;
  comingLater?: boolean;
  dependencies: Dependency[];
  nextAction: string;
};

export async function buildSchoolReadiness(schoolId: string) {
  const db = prisma as any;
  const [
    academicYears,
    activeAcademicYears,
    classes,
    sections,
    subjects,
    students,
    teachers,
    teacherAssignments,
    parentGuardians,
    parentChildLinks,
    leaveRequests,
    attendanceRecords,
    examRecords,
    feeRecords,
    libraryBooks,
    lmsProgress
  ] = await Promise.all([
    db.academicYear.count({ where: { schoolId } }),
    db.academicYear.count({ where: { schoolId, status: "ACTIVE" } }),
    db.classLevel.count({ where: { schoolId } }),
    db.section.count({ where: { schoolId } }),
    db.subject.count({ where: { schoolId } }),
    db.studentProfile.count({ where: { schoolId } }),
    db.teacherProfile.count({ where: { schoolId } }),
    safeCount(() => db.teacherSubjectAssignment.count({ where: { schoolId } })),
    db.schoolMembership.count({ where: { schoolId, role: { code: "PARENT" } } }),
    safeCount(() => db.guardianStudentLink.count({ where: { schoolId, status: "ACTIVE" } })),
    safeCount(() => db.leaveRequest.count({ where: { schoolId } })),
    db.attendanceRecord.count({ where: { schoolId } }),
    db.examRecord.count({ where: { schoolId } }),
    db.feeRecord.count({ where: { schoolId } }),
    db.libraryBook.count({ where: { schoolId } }),
    db.lmsProgress.count({ where: { schoolId } })
  ]);

  const counts = { academicYears, activeAcademicYears, classes, sections, subjects, students, teachers, teacherAssignments, parentGuardians, parentChildLinks, leaveRequests, attendanceRecords, examRecords, feeRecords, libraryBooks, lmsProgress };
  const flags = {
    hasAcademicYear: academicYears > 0,
    hasActiveAcademicYear: activeAcademicYears > 0,
    hasClass: classes > 0,
    hasSection: sections > 0,
    hasSubject: subjects > 0,
    hasStudent: students > 0,
    hasTeacher: teachers > 0,
    hasTeacherAssignment: teacherAssignments > 0,
    hasParentGuardian: parentGuardians > 0,
    hasParentChildLink: parentChildLinks > 0
  };

  const rules = buildModuleRules(flags, counts);
  const modules = Object.fromEntries(Object.entries(rules).map(([id, rule]) => {
    const missingDependencies = rule.dependencies.filter(([, ready]) => !ready).map(([label]) => label);
    const status = rule.comingLater ? "COMING_LATER" : rule.ready ? "READY" : missingDependencies.length ? "DEPENDENCY_REQUIRED" : "SETUP_REQUIRED";
    return [id, { id, label: rule.label, status, ready: rule.ready, nextAction: rule.nextAction, missingDependencies }];
  }));

  return {
    counts,
    flags,
    modules,
    nextActions: Object.values(modules)
      .filter((item: any) => item.status !== "READY")
      .map((item: any) => ({ module: item.label, action: item.nextAction, missingDependencies: item.missingDependencies }))
  };
}

function buildModuleRules(flags: Record<string, boolean>, counts: Record<string, number>): Record<string, ModuleRule> {
  return {
    academic: { label: "Academic Setup", ready: flags.hasActiveAcademicYear, dependencies: [["Active academic year", flags.hasActiveAcademicYear]], nextAction: flags.hasActiveAcademicYear ? "Maintain academic year setup" : "Create and activate an academic year" },
    classes: { label: "Classes", ready: flags.hasClass, dependencies: [["Class", flags.hasClass]], nextAction: flags.hasClass ? "Maintain class records" : "Create a class" },
    sections: { label: "Sections", ready: flags.hasSection, dependencies: [["Class", flags.hasClass], ["Section", flags.hasSection]], nextAction: flags.hasClass ? "Create a section" : "Create a class first" },
    subjects: { label: "Subjects/Courses", ready: flags.hasSubject, dependencies: [["Subject", flags.hasSubject]], nextAction: flags.hasSubject ? "Maintain subject records" : "Create a subject" },
    students: { label: "Students", ready: flags.hasStudent, dependencies: [["Class", flags.hasClass], ["Student", flags.hasStudent]], nextAction: flags.hasClass ? "Create a student profile" : "Create classes before students" },
    teachers: { label: "Teachers", ready: flags.hasTeacher, dependencies: [["Teacher", flags.hasTeacher]], nextAction: flags.hasTeacher ? "Maintain teacher profiles" : "Create a teacher profile" },
    parents: { label: "Parents/Guardians", ready: flags.hasParentChildLink, dependencies: [["Parent/guardian", flags.hasParentGuardian], ["Parent-child link", flags.hasParentChildLink]], nextAction: flags.hasParentGuardian ? "Link parents to students" : "Create a parent or guardian" },
    "teacher-assignments": { label: "Teacher Assignments", ready: flags.hasTeacherAssignment, dependencies: [["Teacher", flags.hasTeacher], ["Class", flags.hasClass], ["Subject", flags.hasSubject], ["Teacher assignment", flags.hasTeacherAssignment]], nextAction: flags.hasTeacher && flags.hasClass && flags.hasSubject ? "Create a teacher assignment" : "Create teacher, class, and subject first" },
    attendance: { label: "Attendance", ready: flags.hasActiveAcademicYear && flags.hasClass && flags.hasSection && flags.hasStudent && flags.hasTeacherAssignment, dependencies: [["Active academic year", flags.hasActiveAcademicYear], ["Class", flags.hasClass], ["Section", flags.hasSection], ["Student", flags.hasStudent], ["Teacher assignment", flags.hasTeacherAssignment]], nextAction: "Complete academic setup, students, and teacher assignments" },
    timetable: { label: "Timetable", ready: flags.hasActiveAcademicYear && flags.hasClass && flags.hasSection && flags.hasSubject && flags.hasTeacherAssignment, dependencies: [["Active academic year", flags.hasActiveAcademicYear], ["Class", flags.hasClass], ["Section", flags.hasSection], ["Subject", flags.hasSubject], ["Teacher assignment", flags.hasTeacherAssignment]], nextAction: "Complete academic setup and teacher assignments" },
    exams: { label: "Exams/Results", ready: flags.hasActiveAcademicYear && flags.hasClass && flags.hasSection && flags.hasSubject && flags.hasStudent, dependencies: [["Active academic year", flags.hasActiveAcademicYear], ["Class", flags.hasClass], ["Section", flags.hasSection], ["Subject", flags.hasSubject], ["Student", flags.hasStudent]], nextAction: "Complete academic setup and student profiles" },
    fees: { label: "Fees/Finance", ready: flags.hasStudent && counts.feeRecords > 0, dependencies: [["Student", flags.hasStudent], ["Fee records", counts.feeRecords > 0]], nextAction: flags.hasStudent ? "Open fee setup in a later phase" : "Create student profiles first" },
    library: { label: "Library", ready: flags.hasStudent && counts.libraryBooks > 0, dependencies: [["Student", flags.hasStudent], ["Library catalog", counts.libraryBooks > 0]], nextAction: flags.hasStudent ? "Open library catalog in a later phase" : "Create student profiles first" },
    lms: { label: "LMS", ready: flags.hasClass && flags.hasSubject && flags.hasTeacherAssignment, dependencies: [["Class", flags.hasClass], ["Subject", flags.hasSubject], ["Teacher assignment", flags.hasTeacherAssignment]], nextAction: "Complete class, subject, and teacher assignment setup" },
    reading: { label: "Reading Program", ready: false, comingLater: true, dependencies: [["Library catalog", counts.libraryBooks > 0]], nextAction: "Build after library catalog is stable" },
    notices: { label: "Notices", ready: false, comingLater: true, dependencies: [["Audience rules", false]], nextAction: "Open notices in a later phase" },
    reports: { label: "Reports", ready: false, comingLater: true, dependencies: [["Real module data", flags.hasStudent || flags.hasTeacherAssignment]], nextAction: "Open reports after module workflows mature" },
    settings: { label: "Settings", ready: false, comingLater: true, dependencies: [["School profile settings", false]], nextAction: "Open settings in a later phase" },
    "parent-engagement": { label: "Parent Engagement", ready: flags.hasParentChildLink, dependencies: [["Parent-child link", flags.hasParentChildLink]], nextAction: "Link a parent to a student" },
    "leave-review": { label: "Leave Review", ready: flags.hasParentChildLink, dependencies: [["Parent-child link", flags.hasParentChildLink], ["Leave request model", true]], nextAction: flags.hasParentChildLink ? "Review submitted parent leave requests" : "Link parent and child first" }
  };
}

async function safeCount(count: () => Promise<number>) {
  try {
    return await count();
  } catch (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }
}

function isMissingTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
}
