import crypto from "node:crypto";
import { PrismaClient, RoleCode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const roles: Array<{ code: RoleCode; name: string; description: string }> = [
  { code: "SUPER_ADMIN", name: "Super Admin", description: "Platform administrator" },
  { code: "SCHOOL_ADMIN", name: "School Admin", description: "School operations administrator" },
  { code: "TEACHER", name: "Teacher", description: "Teacher portal user" },
  { code: "STUDENT", name: "Student", description: "Student portal user" },
  { code: "PARENT", name: "Parent", description: "Parent portal user" },
  { code: "STAFF", name: "Staff", description: "School staff user" },
  { code: "FINANCE_OFFICER", name: "Finance Officer", description: "School finance user" },
  { code: "LIBRARIAN", name: "Librarian", description: "Library operations user" },
  { code: "HR_OFFICER", name: "HR Officer", description: "HR and payroll user" }
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role
    });
  }

  if (process.env.NODE_ENV === "production") {
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 12);
  const school = await prisma.school.upsert({
    where: { slug: "demo-academy" },
    update: {},
    create: {
      name: "Demo Academy",
      slug: "demo-academy"
    }
  });

  const seededUsers = [
    { email: "super.admin@schoolerp.local", name: "Super Admin", role: "SUPER_ADMIN" as RoleCode, schoolId: null },
    { email: "admin@demo-academy.local", name: "School Admin", role: "SCHOOL_ADMIN" as RoleCode, schoolId: school.id },
    { email: "teacher@demo-academy.local", name: "Teacher User", role: "TEACHER" as RoleCode, schoolId: school.id },
    { email: "student@demo-academy.local", name: "Student User", role: "STUDENT" as RoleCode, schoolId: school.id },
    { email: "parent@demo-academy.local", name: "Parent User", role: "PARENT" as RoleCode, schoolId: school.id },
    { email: "finance@demo-academy.local", name: "Finance Officer", role: "FINANCE_OFFICER" as RoleCode, schoolId: school.id },
    { email: "hr@demo-academy.local", name: "HR Officer", role: "HR_OFFICER" as RoleCode, schoolId: school.id },
    { email: "librarian@demo-academy.local", name: "Librarian User", role: "LIBRARIAN" as RoleCode, schoolId: school.id }
  ];

  for (const seeded of seededUsers) {
    const user = await prisma.user.upsert({
      where: { email: seeded.email },
      update: { name: seeded.name, passwordHash },
      create: {
        email: seeded.email,
        name: seeded.name,
        passwordHash
      }
    });
    const role = await prisma.role.findUniqueOrThrow({ where: { code: seeded.role } });
    const existingMembership = await prisma.schoolMembership.findFirst({
      where: {
        userId: user.id,
        schoolId: seeded.schoolId,
        roleId: role.id
      }
    });

    if (existingMembership) {
      await prisma.schoolMembership.update({
        where: { id: existingMembership.id },
        data: { status: "ACTIVE" }
      });
    } else {
      await prisma.schoolMembership.create({
        data: {
          userId: user.id,
          schoolId: seeded.schoolId,
          roleId: role.id,
          status: "ACTIVE"
        }
      });
    }
  }

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Starter" },
    update: {
      description: "Starter plan for small schools",
      monthlyAmount: 9900,
      annualAmount: 99000,
      currency: "USD",
      isActive: true
    },
    create: {
      name: "Starter",
      description: "Starter plan for small schools",
      monthlyAmount: 9900,
      annualAmount: 99000,
      currency: "USD",
      isActive: true
    }
  });

  const existingSubscription = await prisma.subscription.findFirst({
    where: { schoolId: school.id, planId: starterPlan.id }
  });
  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        schoolId: school.id,
        planId: starterPlan.id,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: starterPlan.monthlyAmount,
        currency: starterPlan.currency
      }
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: "platform.support_email" },
    update: {
      value: "support@schoolerp.local",
      description: "Default platform support email",
      isSecret: false
    },
    create: {
      key: "platform.support_email",
      value: "support@schoolerp.local",
      description: "Default platform support email",
      isSecret: false
    }
  });

  const teacherUser = await prisma.user.findUniqueOrThrow({ where: { email: "teacher@demo-academy.local" } });
  const existingTeacherClassroom = await prisma.teacherClassroom.findFirst({
    where: { schoolId: school.id, teacherId: teacherUser.id, className: "Grade 1", sectionName: "A", subject: "Mathematics" }
  });

  if (!existingTeacherClassroom) {
    await prisma.teacherClassroom.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        className: "Grade 1",
        sectionName: "A",
        subject: "Mathematics",
        room: "Room 101",
        schedule: "Monday, Wednesday 09:00-09:45",
        status: "ACTIVE"
      }
    });
    await prisma.teacherAttendance.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        studentName: "Student User",
        className: "Grade 1",
        attendanceDate: new Date("2026-06-12T09:00:00.000Z"),
        status: "PRESENT",
        remarks: "On time"
      }
    });
    await prisma.teacherAssignment.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        title: "Fractions worksheet",
        className: "Grade 1",
        subject: "Mathematics",
        dueDate: new Date("2026-06-19T12:00:00.000Z"),
        maxMarks: 20,
        status: "PUBLISHED"
      }
    });
    await prisma.teacherExamPlan.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        name: "Unit 1 Quiz",
        className: "Grade 1",
        subject: "Mathematics",
        examDate: new Date("2026-06-25T10:00:00.000Z"),
        maxMarks: 30,
        status: "SCHEDULED"
      }
    });
    await prisma.teacherMark.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        studentName: "Student User",
        className: "Grade 1",
        subject: "Mathematics",
        assessment: "Unit 1 Practice",
        marksObtained: 18,
        maxMarks: 20,
        status: "RECORDED"
      }
    });
    await prisma.teacherMaterial.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        title: "Fractions intro slides",
        className: "Grade 1",
        subject: "Mathematics",
        resourceType: "LINK",
        url: "https://schoolerp.local/materials/fractions-intro",
        status: "PUBLISHED"
      }
    });
    await prisma.parentCommunication.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        studentName: "Student User",
        guardianName: "Parent User",
        channel: "PORTAL",
        subject: "Weekly progress",
        message: "Student is progressing well in fractions practice.",
        status: "SENT"
      }
    });
    await prisma.onlineClass.create({
      data: {
        schoolId: school.id,
        teacherId: teacherUser.id,
        title: "Live fractions practice",
        className: "Grade 1",
        subject: "Mathematics",
        startsAt: new Date("2026-06-20T09:00:00.000Z"),
        meetingUrl: "https://meet.schoolerp.local/fractions-practice",
        status: "SCHEDULED"
      }
    });
  }

  const studentUser = await prisma.user.findUniqueOrThrow({ where: { email: "student@demo-academy.local" } });
  await prisma.studentProfile.upsert({
    where: { schoolId_admissionNumber: { schoolId: school.id, admissionNumber: "S-1001" } },
    update: {
      name: "Student User",
      guardianName: "Parent User",
      guardianPhone: "555-0120",
      className: "Grade 1",
      status: "ACTIVE"
    },
    create: {
      schoolId: school.id,
      admissionNumber: "S-1001",
      name: "Student User",
      guardianName: "Parent User",
      guardianPhone: "555-0120",
      className: "Grade 1",
      status: "ACTIVE"
    }
  });

  const existingStudentCertificate = await prisma.studentCertificate.findFirst({
    where: { schoolId: school.id, studentId: studentUser.id, certificateNumber: "CERT-S-1001-2026" }
  });

  if (!existingStudentCertificate) {
    await prisma.timetableSlot.create({
      data: {
        schoolId: school.id,
        className: "Grade 1",
        subject: "Mathematics",
        teacher: "Teacher User",
        dayOfWeek: "Monday",
        startsAt: "09:00",
        endsAt: "09:45",
        status: "ACTIVE"
      }
    });
    await prisma.feeRecord.create({
      data: {
        schoolId: school.id,
        title: "June Tuition",
        amount: 25000,
        dueDate: new Date("2026-06-30T00:00:00.000Z"),
        status: "PENDING"
      }
    });
    await prisma.studentOnlineExam.create({
      data: {
        schoolId: school.id,
        title: "Mathematics Online Quiz",
        className: "Grade 1",
        subject: "Mathematics",
        opensAt: new Date("2026-06-20T08:00:00.000Z"),
        closesAt: new Date("2026-06-20T18:00:00.000Z"),
        durationMinutes: 30,
        status: "OPEN"
      }
    });
    await prisma.studentAssignmentSubmission.create({
      data: {
        schoolId: school.id,
        studentId: studentUser.id,
        assignmentTitle: "Fractions worksheet",
        className: "Grade 1",
        subject: "Mathematics",
        content: "Completed worksheet uploaded through the portal.",
        attachmentUrl: "https://schoolerp.local/submissions/fractions-student-user",
        status: "SUBMITTED"
      }
    });
    await prisma.studentOnlineExamAttempt.create({
      data: {
        schoolId: school.id,
        studentId: studentUser.id,
        examTitle: "Mathematics Online Quiz",
        subject: "Mathematics",
        answers: { q1: "A", q2: "C" },
        score: 24,
        status: "GRADED"
      }
    });
    await prisma.studentCertificate.create({
      data: {
        schoolId: school.id,
        studentId: studentUser.id,
        title: "Participation Certificate",
        certificateNumber: "CERT-S-1001-2026",
        issuedOn: new Date("2026-06-10T00:00:00.000Z"),
        fileUrl: "https://schoolerp.local/certificates/CERT-S-1001-2026.pdf",
        status: "ISSUED"
      }
    });
    await prisma.studentTranscript.create({
      data: {
        schoolId: school.id,
        studentId: studentUser.id,
        title: "Academic Transcript",
        academicYear: "2026-2027",
        gpa: "3.8",
        fileUrl: "https://schoolerp.local/transcripts/S-1001-2026.pdf",
        status: "PUBLISHED"
      }
    });
    await prisma.studentFeePayment.create({
      data: {
        schoolId: school.id,
        studentId: studentUser.id,
        feeTitle: "June Tuition",
        amount: 25000,
        paidOn: new Date("2026-06-12T00:00:00.000Z"),
        method: "ONLINE",
        status: "PAID",
        receiptNumber: "RCPT-S-1001-2026-06"
      }
    });
  }

  const parentUser = await prisma.user.findUniqueOrThrow({ where: { email: "parent@demo-academy.local" } });
  const existingParentPayment = await prisma.parentFeePayment.findFirst({
    where: { schoolId: school.id, parentId: parentUser.id, receiptNumber: "PRCPT-S-1001-2026-06" }
  });

  if (!existingParentPayment) {
    await prisma.parentFeePayment.create({
      data: {
        schoolId: school.id,
        parentId: parentUser.id,
        studentName: "Student User",
        feeTitle: "June Tuition",
        amount: 25000,
        paidOn: new Date("2026-06-12T00:00:00.000Z"),
        method: "ONLINE",
        status: "PAID",
        receiptNumber: "PRCPT-S-1001-2026-06"
      }
    });
    await prisma.parentPortalMessage.create({
      data: {
        schoolId: school.id,
        parentId: parentUser.id,
        studentName: "Student User",
        channel: "PORTAL",
        subject: "Homework support",
        message: "Please share any additional practice material for fractions.",
        status: "SENT"
      }
    });
  }

  const existingAdmissionApplication = await prisma.admissionApplication.findFirst({
    where: { schoolId: school.id, applicationNo: "APP-2026-0001" }
  });

  if (!existingAdmissionApplication) {
    const application = await prisma.admissionApplication.create({
      data: {
        schoolId: school.id,
        applicationNo: "APP-2026-0001",
        applicantName: "New Applicant",
        guardianName: "Applicant Guardian",
        guardianPhone: "555-0199",
        desiredClass: "Grade 1",
        source: "ONLINE",
        appliedOn: new Date("2026-06-12T00:00:00.000Z"),
        status: "SHORTLISTED",
        notes: "Demo admission application for Phase 8."
      }
    });
    await prisma.admissionEnrollment.create({
      data: {
        schoolId: school.id,
        applicationId: application.id,
        studentName: "New Applicant",
        className: "Grade 1",
        enrollmentNo: "ENR-2026-0001",
        enrolledOn: new Date("2026-06-15T00:00:00.000Z"),
        status: "ENROLLED",
        notes: "Enrollment created from demo application."
      }
    });
    await prisma.admissionDocument.create({
      data: {
        schoolId: school.id,
        applicationId: application.id,
        applicantName: "New Applicant",
        documentType: "Birth Certificate",
        fileUrl: "https://schoolerp.local/admissions/documents/app-2026-0001-birth.pdf",
        verifiedBy: "School Admin",
        status: "VERIFIED",
        uploadedOn: new Date("2026-06-12T00:00:00.000Z")
      }
    });
    await prisma.admissionReport.createMany({
      data: [
        { schoolId: school.id, title: "June Admissions Pipeline", period: "2026-06", metric: "Applications", value: 12, status: "PUBLISHED" },
        { schoolId: school.id, title: "June Admissions Pipeline", period: "2026-06", metric: "Enrollments", value: 6, status: "PUBLISHED" },
        { schoolId: school.id, title: "June Admissions Pipeline", period: "2026-06", metric: "Pending Documents", value: 3, status: "PUBLISHED" }
      ]
    });
  }

  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "2026-2027" } },
    update: {
      startsOn: new Date("2026-08-01T00:00:00.000Z"),
      endsOn: new Date("2027-06-30T00:00:00.000Z"),
      status: "ACTIVE"
    },
    create: {
      schoolId: school.id,
      name: "2026-2027",
      startsOn: new Date("2026-08-01T00:00:00.000Z"),
      endsOn: new Date("2027-06-30T00:00:00.000Z"),
      status: "ACTIVE"
    }
  });

  const classLevel = await prisma.classLevel.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "G1" } },
    update: { name: "Grade 1", status: "ACTIVE" },
    create: { schoolId: school.id, name: "Grade 1", code: "G1", status: "ACTIVE" }
  });

  await prisma.section.upsert({
    where: { schoolId_classId_name: { schoolId: school.id, classId: classLevel.id, name: "A" } },
    update: { capacity: 40, status: "ACTIVE" },
    create: { schoolId: school.id, classId: classLevel.id, name: "A", capacity: 40, status: "ACTIVE" }
  });

  await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: "MATH" } },
    update: { name: "Mathematics", type: "CORE", status: "ACTIVE" },
    create: { schoolId: school.id, name: "Mathematics", code: "MATH", type: "CORE", status: "ACTIVE" }
  });

  await prisma.academicTerm.upsert({
    where: { schoolId_academicYear_name: { schoolId: school.id, academicYear: academicYear.name, name: "Term 1" } },
    update: {
      startsOn: new Date("2026-08-01T00:00:00.000Z"),
      endsOn: new Date("2026-12-15T00:00:00.000Z"),
      status: "ACTIVE"
    },
    create: {
      schoolId: school.id,
      academicYear: academicYear.name,
      name: "Term 1",
      startsOn: new Date("2026-08-01T00:00:00.000Z"),
      endsOn: new Date("2026-12-15T00:00:00.000Z"),
      status: "ACTIVE"
    }
  });

  const existingCurriculumPlan = await prisma.curriculumPlan.findFirst({
    where: { schoolId: school.id, academicYear: academicYear.name, term: "Term 1", className: "Grade 1", subject: "Mathematics", title: "Numbers and Fractions" }
  });
  if (!existingCurriculumPlan) {
    await prisma.curriculumPlan.create({
      data: {
        schoolId: school.id,
        academicYear: academicYear.name,
        term: "Term 1",
        className: "Grade 1",
        subject: "Mathematics",
        title: "Numbers and Fractions",
        objectives: "Number sense, place value, addition practice, and introductory fractions.",
        status: "PUBLISHED"
      }
    });
  }

  const existingAttendanceNotification = await prisma.attendanceNotification.findFirst({
    where: { schoolId: school.id, recipientName: "Parent User", recipientType: "PARENT", message: "Student User was marked present today." }
  });

  if (!existingAttendanceNotification) {
    await prisma.attendanceRecord.createMany({
      data: [
        {
          schoolId: school.id,
          personName: "Student User",
          personType: "STUDENT",
          attendanceDate: new Date("2026-06-12T08:30:00.000Z"),
          status: "PRESENT",
          remarks: "Morning attendance"
        },
        {
          schoolId: school.id,
          personName: "Teacher User",
          personType: "TEACHER",
          attendanceDate: new Date("2026-06-12T08:00:00.000Z"),
          status: "PRESENT",
          remarks: "On campus"
        },
        {
          schoolId: school.id,
          personName: "Office Staff",
          personType: "STAFF",
          attendanceDate: new Date("2026-06-12T08:15:00.000Z"),
          status: "PRESENT",
          remarks: "Front desk shift"
        }
      ]
    });
    await prisma.attendanceNotification.create({
      data: {
        schoolId: school.id,
        recipientName: "Parent User",
        recipientType: "PARENT",
        channel: "PORTAL",
        message: "Student User was marked present today.",
        status: "SENT",
        sentAt: new Date("2026-06-12T09:00:00.000Z")
      }
    });
  }

  const existingExaminationSchedule = await prisma.examinationSchedule.findFirst({
    where: { schoolId: school.id, title: "Term 1 Mathematics Exam", className: "Grade 1", subject: "Mathematics" }
  });

  if (!existingExaminationSchedule) {
    await prisma.examinationSchedule.create({
      data: {
        schoolId: school.id,
        title: "Term 1 Mathematics Exam",
        className: "Grade 1",
        subject: "Mathematics",
        examDate: new Date("2026-12-10T09:00:00.000Z"),
        maxMarks: 100,
        status: "SCHEDULED"
      }
    });
    await prisma.questionBankItem.create({
      data: {
        schoolId: school.id,
        className: "Grade 1",
        subject: "Mathematics",
        questionType: "MCQ",
        question: "What is one half of 10?",
        answer: "5",
        marks: 2,
        status: "ACTIVE"
      }
    });
    await prisma.examinationOnlineExam.create({
      data: {
        schoolId: school.id,
        title: "Term 1 Mathematics Online Exam",
        className: "Grade 1",
        subject: "Mathematics",
        opensAt: new Date("2026-12-10T08:00:00.000Z"),
        closesAt: new Date("2026-12-10T18:00:00.000Z"),
        durationMinutes: 45,
        totalMarks: 100,
        status: "PUBLISHED"
      }
    });
    await prisma.examinationResult.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        className: "Grade 1",
        subject: "Mathematics",
        examTitle: "Term 1 Mathematics Exam",
        marksObtained: 88,
        maxMarks: 100,
        grade: "A",
        status: "PUBLISHED"
      }
    });
    await prisma.reportCard.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        className: "Grade 1",
        academicYear: "2026-2027",
        term: "Term 1",
        totalMarks: 100,
        obtainedMarks: 88,
        grade: "A",
        fileUrl: "https://schoolerp.local/report-cards/student-user-term-1.pdf",
        status: "PUBLISHED"
      }
    });
  }

  const existingLmsCourse = await prisma.lmsCourse.findFirst({
    where: { schoolId: school.id, title: "Grade 1 Mathematics Foundations", className: "Grade 1", subject: "Mathematics" }
  });

  if (!existingLmsCourse) {
    await prisma.lmsCourse.create({
      data: {
        schoolId: school.id,
        title: "Grade 1 Mathematics Foundations",
        className: "Grade 1",
        subject: "Mathematics",
        instructorName: "Teacher User",
        description: "Number sense, addition practice, and introductory fractions for Grade 1 learners.",
        status: "PUBLISHED"
      }
    });
    await prisma.lmsMaterial.create({
      data: {
        schoolId: school.id,
        courseTitle: "Grade 1 Mathematics Foundations",
        title: "Fractions practice workbook",
        className: "Grade 1",
        subject: "Mathematics",
        materialType: "PDF",
        fileUrl: "https://schoolerp.local/lms/materials/fractions-practice-workbook.pdf",
        status: "PUBLISHED"
      }
    });
    await prisma.lmsVideo.create({
      data: {
        schoolId: school.id,
        courseTitle: "Grade 1 Mathematics Foundations",
        title: "Understanding halves",
        className: "Grade 1",
        subject: "Mathematics",
        videoUrl: "https://schoolerp.local/lms/videos/understanding-halves",
        durationMinutes: 12,
        status: "PUBLISHED"
      }
    });
    await prisma.lmsQuiz.create({
      data: {
        schoolId: school.id,
        courseTitle: "Grade 1 Mathematics Foundations",
        title: "Fractions checkpoint",
        className: "Grade 1",
        subject: "Mathematics",
        dueDate: new Date("2026-12-12T18:00:00.000Z"),
        totalMarks: 20,
        status: "PUBLISHED"
      }
    });
    await prisma.lmsProgress.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        courseTitle: "Grade 1 Mathematics Foundations",
        className: "Grade 1",
        completedLessons: 3,
        totalLessons: 8,
        progressPercent: 38,
        status: "IN_PROGRESS"
      }
    });
  }

  const existingFinanceInvoice = await prisma.financeInvoice.findFirst({
    where: { schoolId: school.id, invoiceNumber: "INV-S-1001-2026-06" }
  });

  if (!existingFinanceInvoice) {
    await prisma.financeInvoice.create({
      data: {
        schoolId: school.id,
        invoiceNumber: "INV-S-1001-2026-06",
        studentName: "Student User",
        feeTitle: "June Tuition",
        amount: 25000,
        dueDate: new Date("2026-06-30T00:00:00.000Z"),
        status: "PENDING"
      }
    });
    await prisma.financePayment.create({
      data: {
        schoolId: school.id,
        receiptNumber: "FIN-RCPT-S-1001-2026-06",
        payerName: "Parent User",
        studentName: "Student User",
        invoiceNumber: "INV-S-1001-2026-06",
        amount: 15000,
        paidOn: new Date("2026-06-12T00:00:00.000Z"),
        method: "BANK_TRANSFER",
        status: "PAID"
      }
    });
    await prisma.financeScholarship.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        title: "Academic Merit Scholarship",
        amount: 5000,
        academicYear: "2026-2027",
        status: "ACTIVE"
      }
    });
    await prisma.financeDiscount.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        feeTitle: "June Tuition",
        discountType: "MERIT",
        amount: 2500,
        reason: "Merit discount approved for term performance.",
        status: "APPROVED"
      }
    });
    await prisma.financeReport.createMany({
      data: [
        { schoolId: school.id, title: "June Finance Summary", period: "2026-06", metric: "Invoices", value: 1, amount: 25000, status: "PUBLISHED" },
        { schoolId: school.id, title: "June Finance Summary", period: "2026-06", metric: "Payments", value: 1, amount: 15000, status: "PUBLISHED" },
        { schoolId: school.id, title: "June Finance Summary", period: "2026-06", metric: "Discounts", value: 1, amount: 2500, status: "PUBLISHED" }
      ]
    });
  }

  const existingHrEmployee = await prisma.hrEmployee.findFirst({
    where: { schoolId: school.id, employeeNumber: "EMP-1001" }
  });

  if (!existingHrEmployee) {
    await prisma.hrEmployee.create({
      data: {
        schoolId: school.id,
        employeeNumber: "EMP-1001",
        name: "Teacher User",
        department: "Academics",
        designation: "Mathematics Teacher",
        email: "teacher@demo-academy.local",
        phone: "555-0140",
        joiningDate: new Date("2025-08-01T00:00:00.000Z"),
        salary: 65000,
        status: "ACTIVE"
      }
    });
    await prisma.hrLeave.create({
      data: {
        schoolId: school.id,
        employeeName: "Teacher User",
        leaveType: "CASUAL",
        startsOn: new Date("2026-07-10T00:00:00.000Z"),
        endsOn: new Date("2026-07-11T00:00:00.000Z"),
        days: 2,
        reason: "Family commitment.",
        status: "APPROVED"
      }
    });
    await prisma.hrPayroll.create({
      data: {
        schoolId: school.id,
        employeeName: "Teacher User",
        payrollMonth: "2026-06",
        basicSalary: 65000,
        allowances: 5000,
        deductions: 2000,
        netSalary: 68000,
        status: "PROCESSED"
      }
    });
    await prisma.hrSalarySlip.create({
      data: {
        schoolId: school.id,
        slipNumber: "SLIP-EMP-1001-2026-06",
        employeeName: "Teacher User",
        payrollMonth: "2026-06",
        netSalary: 68000,
        fileUrl: "https://schoolerp.local/hr/salary-slips/SLIP-EMP-1001-2026-06.pdf",
        status: "ISSUED"
      }
    });
  }

  const existingLibraryBook = await prisma.libraryBook.findFirst({
    where: { schoolId: school.id, isbn: "978-0-00-000001-5" }
  });

  if (!existingLibraryBook) {
    await prisma.libraryBook.create({
      data: {
        schoolId: school.id,
        title: "Mathematics Stories for Grade 1",
        author: "Demo Academy Press",
        isbn: "978-0-00-000001-5",
        copies: 4,
        status: "AVAILABLE"
      }
    });
    await prisma.libraryIssue.create({
      data: {
        schoolId: school.id,
        bookTitle: "Mathematics Stories for Grade 1",
        isbn: "978-0-00-000001-5",
        borrowerName: "Student User",
        borrowerType: "STUDENT",
        issuedOn: new Date("2026-06-12T00:00:00.000Z"),
        dueOn: new Date("2026-06-26T00:00:00.000Z"),
        status: "ISSUED"
      }
    });
    await prisma.libraryReturn.create({
      data: {
        schoolId: school.id,
        bookTitle: "Mathematics Stories for Grade 1",
        isbn: "978-0-00-000001-5",
        borrowerName: "Student User",
        returnedOn: new Date("2026-06-20T00:00:00.000Z"),
        condition: "GOOD",
        status: "RETURNED"
      }
    });
    await prisma.libraryFine.create({
      data: {
        schoolId: school.id,
        borrowerName: "Student User",
        bookTitle: "Mathematics Stories for Grade 1",
        amount: 100,
        reason: "One day late return.",
        issuedOn: new Date("2026-06-21T00:00:00.000Z"),
        status: "PENDING"
      }
    });
  }

  const existingCommunicationAnnouncement = await prisma.communicationAnnouncement.findFirst({
    where: { schoolId: school.id, title: "Parent teacher meeting reminder", audience: "PARENTS" }
  });

  if (!existingCommunicationAnnouncement) {
    await prisma.communicationSms.create({
      data: {
        schoolId: school.id,
        recipientName: "Parent User",
        phone: "555-0120",
        message: "Reminder: parent teacher meeting is scheduled for Friday.",
        sentAt: new Date("2026-06-12T09:00:00.000Z"),
        status: "SENT"
      }
    });
    await prisma.communicationEmail.create({
      data: {
        schoolId: school.id,
        recipientName: "Parent User",
        email: "parent@demo-academy.local",
        subject: "Weekly learning update",
        body: "Student User completed this week's mathematics practice.",
        sentAt: new Date("2026-06-12T09:05:00.000Z"),
        status: "SENT"
      }
    });
    await prisma.communicationPushNotification.create({
      data: {
        schoolId: school.id,
        recipientName: "Student User",
        title: "Assignment reminder",
        body: "Fractions worksheet is due tomorrow.",
        sentAt: new Date("2026-06-12T09:10:00.000Z"),
        status: "SENT"
      }
    });
    await prisma.communicationMessage.create({
      data: {
        schoolId: school.id,
        senderName: "Teacher User",
        recipientName: "Parent User",
        subject: "Progress follow-up",
        message: "Student User is doing well with fractions practice.",
        status: "SENT"
      }
    });
    await prisma.communicationAnnouncement.create({
      data: {
        schoolId: school.id,
        title: "Parent teacher meeting reminder",
        audience: "PARENTS",
        body: "Parent teacher meetings will be held this Friday from 10:00 to 12:00.",
        publishOn: new Date("2026-06-12T00:00:00.000Z"),
        status: "PUBLISHED"
      }
    });
  }

  const existingAnalyticsDashboard = await prisma.analyticsDashboard.findFirst({
    where: { schoolId: school.id, title: "Executive Overview", audience: "SCHOOL_ADMIN" }
  });

  if (!existingAnalyticsDashboard) {
    await prisma.studentAnalyticsReport.create({
      data: {
        schoolId: school.id,
        title: "Student Performance Summary",
        studentName: "Student User",
        className: "Grade 1",
        academicYear: "2026-2027",
        metric: "Average Score",
        value: 88,
        status: "PUBLISHED"
      }
    });
    await prisma.teacherAnalyticsReport.create({
      data: {
        schoolId: school.id,
        title: "Teacher Workload Summary",
        teacherName: "Teacher User",
        department: "Academics",
        metric: "Assigned Classes",
        value: 3,
        status: "PUBLISHED"
      }
    });
    await prisma.attendanceAnalyticsReport.create({
      data: {
        schoolId: school.id,
        title: "June Student Attendance",
        period: "2026-06",
        personType: "STUDENT",
        presentCount: 22,
        absentCount: 2,
        status: "PUBLISHED"
      }
    });
    await prisma.financialAnalyticsReport.create({
      data: {
        schoolId: school.id,
        title: "June Financial Summary",
        period: "2026-06",
        revenueAmount: 15000,
        expenseAmount: 8000,
        balanceAmount: 7000,
        status: "PUBLISHED"
      }
    });
    await prisma.analyticsDashboard.create({
      data: {
        schoolId: school.id,
        title: "Executive Overview",
        audience: "SCHOOL_ADMIN",
        widgetCount: 8,
        refreshCadence: "DAILY",
        status: "PUBLISHED"
      }
    });
  }

  const existingStudentDocument = await prisma.documentStudent.findFirst({
    where: { schoolId: school.id, studentName: "Student User", documentType: "Birth Certificate" }
  });

  if (!existingStudentDocument) {
    await prisma.documentStudent.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        documentType: "Birth Certificate",
        fileUrl: "https://schoolerp.local/documents/students/student-user-birth-certificate.pdf",
        verifiedBy: "School Admin",
        uploadedOn: new Date("2026-06-12T00:00:00.000Z"),
        status: "VERIFIED"
      }
    });
    await prisma.documentTeacher.create({
      data: {
        schoolId: school.id,
        teacherName: "Teacher User",
        documentType: "Teaching Certificate",
        fileUrl: "https://schoolerp.local/documents/teachers/teacher-user-certificate.pdf",
        verifiedBy: "HR Officer",
        uploadedOn: new Date("2026-06-12T00:00:00.000Z"),
        status: "VERIFIED"
      }
    });
    await prisma.documentContract.create({
      data: {
        schoolId: school.id,
        partyName: "Teacher User",
        contractType: "Employment",
        fileUrl: "https://schoolerp.local/documents/contracts/teacher-user-employment.pdf",
        effectiveOn: new Date("2026-08-01T00:00:00.000Z"),
        expiresOn: new Date("2027-07-31T00:00:00.000Z"),
        status: "ACTIVE"
      }
    });
    await prisma.documentArchive.create({
      data: {
        schoolId: school.id,
        title: "2025 Admissions Archive",
        archiveType: "ADMISSIONS",
        fileUrl: "https://schoolerp.local/documents/archive/2025-admissions.zip",
        archivedBy: "School Admin",
        archivedOn: new Date("2026-06-12T00:00:00.000Z"),
        retentionTag: "RETENTION_5_YEARS",
        status: "ARCHIVED"
      }
    });
  }

  const existingCertificateRecord = await prisma.certificateRecord.findFirst({
    where: { schoolId: school.id, certificateNumber: "CERT-MGMT-S-1001-2026" }
  });

  if (!existingCertificateRecord) {
    await prisma.certificateRecord.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        certificateNumber: "CERT-MGMT-S-1001-2026",
        title: "Academic Excellence Certificate",
        issuedOn: new Date("2026-06-12T00:00:00.000Z"),
        fileUrl: "https://schoolerp.local/certificates/CERT-MGMT-S-1001-2026.pdf",
        status: "ISSUED"
      }
    });
    await prisma.transcriptRecord.create({
      data: {
        schoolId: school.id,
        studentName: "Student User",
        transcriptNumber: "TRN-S-1001-2026",
        academicYear: "2026-2027",
        gpa: "3.8",
        fileUrl: "https://schoolerp.local/transcripts/TRN-S-1001-2026.pdf",
        status: "PUBLISHED"
      }
    });
    await prisma.certificateVerification.create({
      data: {
        schoolId: school.id,
        verificationCode: "VERIFY-CERT-S-1001-2026",
        certificateNumber: "CERT-MGMT-S-1001-2026",
        studentName: "Student User",
        verifiedOn: new Date("2026-06-12T00:00:00.000Z"),
        status: "VALID"
      }
    });
  }

  const existingMeetingSchedule = await prisma.meetingSchedule.findFirst({
    where: { schoolId: school.id, title: "Monthly Academic Planning", scheduledFor: new Date("2026-06-18T10:00:00.000Z") }
  });

  if (!existingMeetingSchedule) {
    await prisma.meetingSchedule.create({
      data: {
        schoolId: school.id,
        title: "Monthly Academic Planning",
        meetingType: "ACADEMIC",
        scheduledFor: new Date("2026-06-18T10:00:00.000Z"),
        durationMinutes: 60,
        location: "Conference Room A",
        organizerName: "School Admin",
        agenda: "Review term plans, assessment dates, and intervention support.",
        status: "SCHEDULED"
      }
    });
    await prisma.meetingMinute.create({
      data: {
        schoolId: school.id,
        meetingTitle: "Monthly Academic Planning",
        recordedBy: "Teacher User",
        heldOn: new Date("2026-06-12T10:00:00.000Z"),
        summary: "Reviewed academic priorities, pending curriculum updates, and student support actions.",
        decisions: "Publish updated assessment calendar and assign intervention owners.",
        actionItems: "Academic coordinator to share calendar; teachers to submit support plans.",
        status: "RECORDED"
      }
    });
    await prisma.meetingRecord.create({
      data: {
        schoolId: school.id,
        title: "Parent Teacher Coordination",
        meetingType: "PARENT_TEACHER",
        startsAt: new Date("2026-06-20T09:00:00.000Z"),
        endsAt: new Date("2026-06-20T11:00:00.000Z"),
        attendees: "School Admin, Teacher User, Parent User",
        location: "Main Hall",
        status: "PLANNED"
      }
    });
  }

  const existingWebsitePage = await prisma.websitePage.findFirst({
    where: { schoolId: school.id, slug: "welcome-to-demo-academy" }
  });

  if (!existingWebsitePage) {
    await prisma.websitePage.create({
      data: {
        schoolId: school.id,
        title: "Welcome to Demo Academy",
        slug: "welcome-to-demo-academy",
        pageType: "HOME",
        heroTitle: "A focused school community for confident learners",
        heroImageUrl: "https://schoolerp.local/cms/home-hero.jpg",
        content: "Demo Academy combines strong academics, caring mentors, and a practical student support system.",
        publishedAt: new Date("2026-06-13T00:00:00.000Z"),
        status: "PUBLISHED"
      }
    });
    await prisma.blogPost.create({
      data: {
        schoolId: school.id,
        title: "How Demo Academy Supports Daily Learning",
        slug: "daily-learning-support",
        authorName: "School Admin",
        category: "Academics",
        excerpt: "A look at the routines, feedback loops, and learning resources used across the school.",
        content: "Teachers coordinate attendance, assignments, materials, and parent communication through the ERP workspace.",
        coverImageUrl: "https://schoolerp.local/cms/blog-daily-learning.jpg",
        publishedAt: new Date("2026-06-13T00:00:00.000Z"),
        status: "PUBLISHED"
      }
    });
    await prisma.newsItem.create({
      data: {
        schoolId: school.id,
        title: "Admissions Open for 2026-2027",
        slug: "admissions-open-2026-2027",
        summary: "Applications are now open for the 2026-2027 academic year.",
        body: "Families can submit applications, upload documents, and track enrollment updates through the admissions workflow.",
        publishedOn: new Date("2026-06-13T00:00:00.000Z"),
        status: "PUBLISHED"
      }
    });
    await prisma.websiteAnnouncement.create({
      data: {
        schoolId: school.id,
        title: "Parent Orientation Week",
        audience: "Parents",
        message: "Parent orientation sessions will run during the final week of June.",
        startsOn: new Date("2026-06-24T00:00:00.000Z"),
        endsOn: new Date("2026-06-28T00:00:00.000Z"),
        status: "PUBLISHED"
      }
    });
    await prisma.cmsAdmissionPage.create({
      data: {
        schoolId: school.id,
        title: "Primary School Admissions",
        slug: "primary-school-admissions",
        programName: "Primary School",
        intakeYear: "2026-2027",
        requirements: "Birth certificate, previous school record, guardian CNIC, and two photographs.",
        content: "Our primary program builds foundations in literacy, numeracy, science, and character development.",
        ctaLabel: "Apply Now",
        ctaUrl: "/admissions/apply",
        status: "PUBLISHED"
      }
    });
  }

  const existingMobileDevice = await prisma.mobileDevice.findFirst({
    where: { schoolId: school.id, deviceToken: "mobile-demo-student-device" }
  });

  if (!existingMobileDevice) {
    await prisma.mobileDevice.createMany({
      data: [
        {
          schoolId: school.id,
          userName: "Student User",
          userEmail: "student@demo-academy.local",
          role: "STUDENT",
          deviceToken: "mobile-demo-student-device",
          platform: "IOS",
          appVersion: "1.0.0",
          status: "ACTIVE",
          lastSeenAt: new Date("2026-06-13T08:00:00.000Z")
        },
        {
          schoolId: school.id,
          userName: "Teacher User",
          userEmail: "teacher@demo-academy.local",
          role: "TEACHER",
          deviceToken: "mobile-demo-teacher-device",
          platform: "ANDROID",
          appVersion: "1.0.0",
          status: "ACTIVE",
          lastSeenAt: new Date("2026-06-13T08:05:00.000Z")
        },
        {
          schoolId: school.id,
          userName: "Parent User",
          userEmail: "parent@demo-academy.local",
          role: "PARENT",
          deviceToken: "mobile-demo-parent-device",
          platform: "ANDROID",
          appVersion: "1.0.0",
          status: "ACTIVE",
          lastSeenAt: new Date("2026-06-13T08:10:00.000Z")
        }
      ]
    });
    await prisma.mobileSyncLog.createMany({
      data: [
        {
          schoolId: school.id,
          userEmail: "student@demo-academy.local",
          role: "STUDENT",
          endpoint: "/api/v1/mobile/student/dashboard",
          syncType: "DASHBOARD",
          recordsSynced: 8,
          status: "SUCCESS",
          syncedAt: new Date("2026-06-13T08:00:00.000Z"),
          metadata: { appVersion: "1.0.0" }
        },
        {
          schoolId: school.id,
          userEmail: "teacher@demo-academy.local",
          role: "TEACHER",
          endpoint: "/api/v1/mobile/teacher/dashboard",
          syncType: "DASHBOARD",
          recordsSynced: 8,
          status: "SUCCESS",
          syncedAt: new Date("2026-06-13T08:05:00.000Z"),
          metadata: { appVersion: "1.0.0" }
        },
        {
          schoolId: school.id,
          userEmail: "parent@demo-academy.local",
          role: "PARENT",
          endpoint: "/api/v1/mobile/parent/dashboard",
          syncType: "DASHBOARD",
          recordsSynced: 7,
          status: "SUCCESS",
          syncedAt: new Date("2026-06-13T08:10:00.000Z"),
          metadata: { appVersion: "1.0.0" }
        }
      ]
    });
  }

  const existingLedgerEntry = await prisma.generalLedgerEntry.findFirst({
    where: { schoolId: school.id, entryNumber: "GL-2026-0001" }
  });

  if (!existingLedgerEntry) {
    await prisma.chartOfAccount.createMany({
      data: [
        {
          schoolId: school.id,
          accountCode: "4000",
          accountName: "Tuition Revenue",
          accountType: "REVENUE",
          parentCode: null,
          description: "Student tuition and academic fee income.",
          status: "ACTIVE"
        },
        {
          schoolId: school.id,
          accountCode: "6100",
          accountName: "Academic Supplies",
          accountType: "EXPENSE",
          parentCode: null,
          description: "Teaching materials, lab supplies, and classroom consumables.",
          status: "ACTIVE"
        }
      ]
    });
    await prisma.generalLedgerEntry.createMany({
      data: [
        {
          schoolId: school.id,
          entryNumber: "GL-2026-0001",
          accountCode: "4000",
          accountName: "Tuition Revenue",
          entryDate: new Date("2026-06-13T00:00:00.000Z"),
          description: "June tuition revenue recognition.",
          debitAmount: 0,
          creditAmount: 25000,
          referenceType: "INVOICE",
          referenceNumber: "INV-S-1001-2026-07",
          status: "POSTED"
        },
        {
          schoolId: school.id,
          entryNumber: "GL-2026-0002",
          accountCode: "6100",
          accountName: "Academic Supplies",
          entryDate: new Date("2026-06-13T00:00:00.000Z"),
          description: "Science lab supplies purchased.",
          debitAmount: 8000,
          creditAmount: 0,
          referenceType: "EXPENSE",
          referenceNumber: "EXP-2026-0001",
          status: "POSTED"
        }
      ]
    });
    await prisma.budgetRecord.create({
      data: {
        schoolId: school.id,
        budgetCode: "BUD-ACADEMIC-2026",
        title: "Academic Department Budget",
        department: "Academic",
        fiscalYear: "2026-2027",
        budgetAmount: 500000,
        spentAmount: 8000,
        ownerName: "School Admin",
        status: "APPROVED"
      }
    });
    await prisma.expenseRecord.create({
      data: {
        schoolId: school.id,
        expenseNumber: "EXP-2026-0001",
        vendorName: "City Science Supplies",
        department: "Academic",
        expenseDate: new Date("2026-06-13T00:00:00.000Z"),
        category: "Supplies",
        amount: 8000,
        paymentMethod: "BANK_TRANSFER",
        status: "APPROVED"
      }
    });
    await prisma.financialStatement.create({
      data: {
        schoolId: school.id,
        statementNumber: "FS-2026-06",
        title: "June Income Statement",
        statementType: "INCOME_STATEMENT",
        period: "2026-06",
        revenueAmount: 25000,
        expenseAmount: 8000,
        netAmount: 17000,
        preparedBy: "Finance Officer",
        status: "PUBLISHED"
      }
    });
  }

  const securitySecret = await prisma.securitySecret.findFirst({
    where: { schoolId: school.id, key: "s3.backup.access_token" }
  });
  const schoolAdminUser = await prisma.user.findUniqueOrThrow({ where: { email: "admin@demo-academy.local" } });
  const encrypted = encryptForSeed("demo-backup-token", process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-dev-refresh-secret");

  if (!securitySecret) {
    await prisma.securitySecret.create({
      data: {
        schoolId: school.id,
        key: "s3.backup.access_token",
        encryptedValue: encrypted.encryptedValue,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        algorithm: "AES-256-GCM",
        status: "ACTIVE",
        rotatedAt: new Date("2026-06-13T00:00:00.000Z")
      }
    });
    await prisma.apiSecurityRule.create({
      data: {
        schoolId: school.id,
        name: "Block path traversal probes",
        ruleType: "REQUEST_PATTERN",
        pattern: "../|%2e%2e",
        action: "BLOCK",
        severity: "HIGH",
        status: "ACTIVE"
      }
    });
    await prisma.securityBackupPolicy.create({
      data: {
        schoolId: school.id,
        name: "Daily encrypted school backup",
        frequency: "DAILY",
        retentionDays: 30,
        storageTarget: "S3_COMPATIBLE",
        encryptionEnabled: true,
        lastBackupAt: new Date("2026-06-13T00:00:00.000Z"),
        status: "ACTIVE"
      }
    });
  }

  await prisma.userTwoFactorSetting.upsert({
    where: { userId_schoolId: { userId: schoolAdminUser.id, schoolId: school.id } },
    update: {},
    create: {
      userId: schoolAdminUser.id,
      schoolId: school.id,
      secretEncrypted: `${encrypted.iv}:${encrypted.authTag}:${encrypted.encryptedValue}`,
      enabled: false,
      status: "PENDING",
      recoveryCodes: []
    }
  });

  const existingPerformanceCheck = await prisma.performanceCheck.findFirst({
    where: { schoolId: school.id, area: "API", metric: "Health endpoint latency" }
  });

  if (!existingPerformanceCheck) {
    await prisma.performanceCheck.createMany({
      data: [
        { schoolId: school.id, area: "API", metric: "Health endpoint latency", value: 42, unit: "ms", threshold: 250, status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Measured during release verification." },
        { schoolId: school.id, area: "WEB", metric: "Production route count", value: 29, unit: "routes", threshold: 25, status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Next build generated all expected protected routes." }
      ]
    });
    await prisma.accessibilityAudit.createMany({
      data: [
        { schoolId: school.id, page: "/login", rule: "Form labels and keyboard navigation", impact: "SERIOUS", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Login page uses labeled fields and focusable controls." },
        { schoolId: school.id, page: "/school-admin", rule: "Landmarks and navigation labels", impact: "MODERATE", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Protected shell exposes labeled role navigation." }
      ]
    });
    await prisma.seoCheck.createMany({
      data: [
        { schoolId: school.id, page: "/", title: "School ERP Management System", description: "Production-ready multi-school ERP platform.", canonical: "https://schoolerp.local", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Root metadata and sitemap/robots are configured." },
        { schoolId: school.id, page: "/login", title: "School ERP Login", description: "Secure login for school ERP users.", canonical: "https://schoolerp.local/login", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Authentication entry point is indexable only through configured metadata." }
      ]
    });
    await prisma.errorMonitoringEvent.create({
      data: {
        schoolId: school.id,
        source: "api.release-check",
        severity: "INFO",
        message: "Error monitoring pipeline initialized for production readiness.",
        status: "RESOLVED",
        occurredAt: new Date("2026-06-13T00:00:00.000Z")
      }
    });
    await prisma.deploymentCheck.createMany({
      data: [
        { schoolId: school.id, environment: "production", checkName: "Environment variables validated", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "API env schema validates database, JWT secrets, token TTLs, and web origin." },
        { schoolId: school.id, environment: "production", checkName: "Database migrations applied", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "All approved phase migrations resolved in Prisma history." }
      ]
    });
    await prisma.loadTestResult.create({
      data: {
        schoolId: school.id,
        scenario: "Authenticated dashboard smoke load",
        virtualUsers: 25,
        durationSeconds: 60,
        requestsPerSecond: 50,
        p95Ms: 180,
        errorRate: 0,
        status: "PASS",
        testedAt: new Date("2026-06-13T00:00:00.000Z"),
        notes: "Synthetic release load target for core dashboard endpoints."
      }
    });
    await prisma.regressionCheck.createMany({
      data: [
        { schoolId: school.id, suite: "Auth", checkName: "Login and RBAC regression", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "API AuthService tests pass." },
        { schoolId: school.id, suite: "Build", checkName: "API and web production builds", status: "PASS", checkedAt: new Date("2026-06-13T00:00:00.000Z"), notes: "Release build check tracked in Phase 25." }
      ]
    });
  }
}

function encryptForSeed(value: string, secret: string) {
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    encryptedValue: encrypted.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url")
  };
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
