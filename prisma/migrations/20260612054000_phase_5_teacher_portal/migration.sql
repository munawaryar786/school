-- Phase 5: Teacher Portal
CREATE TABLE "TeacherClassroom" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "sectionName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "room" TEXT,
  "schedule" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherClassroom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherAttendance" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "attendanceDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PRESENT',
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherAssignment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherExamPlan" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "examDate" TIMESTAMP(3) NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherExamPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherMark" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "assessment" TEXT NOT NULL,
  "marksObtained" INTEGER NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'RECORDED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherMark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherMaterial" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL DEFAULT 'LINK',
  "url" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParentCommunication" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "guardianName" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'PORTAL',
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ParentCommunication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnlineClass" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "meetingUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OnlineClass_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeacherClassroom_schoolId_teacherId_idx" ON "TeacherClassroom"("schoolId", "teacherId");
CREATE INDEX "TeacherClassroom_schoolId_status_idx" ON "TeacherClassroom"("schoolId", "status");
CREATE INDEX "TeacherAttendance_schoolId_teacherId_idx" ON "TeacherAttendance"("schoolId", "teacherId");
CREATE INDEX "TeacherAttendance_schoolId_attendanceDate_idx" ON "TeacherAttendance"("schoolId", "attendanceDate");
CREATE INDEX "TeacherAttendance_schoolId_status_idx" ON "TeacherAttendance"("schoolId", "status");
CREATE INDEX "TeacherAssignment_schoolId_teacherId_idx" ON "TeacherAssignment"("schoolId", "teacherId");
CREATE INDEX "TeacherAssignment_schoolId_status_idx" ON "TeacherAssignment"("schoolId", "status");
CREATE INDEX "TeacherAssignment_schoolId_dueDate_idx" ON "TeacherAssignment"("schoolId", "dueDate");
CREATE INDEX "TeacherExamPlan_schoolId_teacherId_idx" ON "TeacherExamPlan"("schoolId", "teacherId");
CREATE INDEX "TeacherExamPlan_schoolId_status_idx" ON "TeacherExamPlan"("schoolId", "status");
CREATE INDEX "TeacherExamPlan_schoolId_examDate_idx" ON "TeacherExamPlan"("schoolId", "examDate");
CREATE INDEX "TeacherMark_schoolId_teacherId_idx" ON "TeacherMark"("schoolId", "teacherId");
CREATE INDEX "TeacherMark_schoolId_status_idx" ON "TeacherMark"("schoolId", "status");
CREATE INDEX "TeacherMaterial_schoolId_teacherId_idx" ON "TeacherMaterial"("schoolId", "teacherId");
CREATE INDEX "TeacherMaterial_schoolId_status_idx" ON "TeacherMaterial"("schoolId", "status");
CREATE INDEX "ParentCommunication_schoolId_teacherId_idx" ON "ParentCommunication"("schoolId", "teacherId");
CREATE INDEX "ParentCommunication_schoolId_status_idx" ON "ParentCommunication"("schoolId", "status");
CREATE INDEX "OnlineClass_schoolId_teacherId_idx" ON "OnlineClass"("schoolId", "teacherId");
CREATE INDEX "OnlineClass_schoolId_status_idx" ON "OnlineClass"("schoolId", "status");
CREATE INDEX "OnlineClass_schoolId_startsAt_idx" ON "OnlineClass"("schoolId", "startsAt");

ALTER TABLE "TeacherClassroom" ADD CONSTRAINT "TeacherClassroom_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherClassroom" ADD CONSTRAINT "TeacherClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherExamPlan" ADD CONSTRAINT "TeacherExamPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherExamPlan" ADD CONSTRAINT "TeacherExamPlan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherMark" ADD CONSTRAINT "TeacherMark_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherMark" ADD CONSTRAINT "TeacherMark_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherMaterial" ADD CONSTRAINT "TeacherMaterial_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherMaterial" ADD CONSTRAINT "TeacherMaterial_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentCommunication" ADD CONSTRAINT "ParentCommunication_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentCommunication" ADD CONSTRAINT "ParentCommunication_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnlineClass" ADD CONSTRAINT "OnlineClass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnlineClass" ADD CONSTRAINT "OnlineClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
