-- Phase 32D Core School Setup & People Foundation
-- Adds verified guardian-child links and teacher class/section/subject assignment foundation.

CREATE TYPE "GuardianRelationType" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER');

CREATE TABLE "GuardianStudentLink" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "parentUserId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "relationType" "GuardianRelationType" NOT NULL DEFAULT 'GUARDIAN',
  "isEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
  "canLogin" BOOLEAN NOT NULL DEFAULT true,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GuardianStudentLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherSubjectAssignment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "sectionId" TEXT,
  "subjectId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherSubjectAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuardianStudentLink_schoolId_parentUserId_studentId_key" ON "GuardianStudentLink"("schoolId", "parentUserId", "studentId");
CREATE INDEX "GuardianStudentLink_schoolId_parentUserId_idx" ON "GuardianStudentLink"("schoolId", "parentUserId");
CREATE INDEX "GuardianStudentLink_schoolId_studentId_idx" ON "GuardianStudentLink"("schoolId", "studentId");
CREATE INDEX "GuardianStudentLink_schoolId_relationType_idx" ON "GuardianStudentLink"("schoolId", "relationType");
CREATE INDEX "GuardianStudentLink_schoolId_status_idx" ON "GuardianStudentLink"("schoolId", "status");

CREATE UNIQUE INDEX "TeacherSubjectAssignment_schoolId_teacherId_classId_sectionId_subjectId_key" ON "TeacherSubjectAssignment"("schoolId", "teacherId", "classId", "sectionId", "subjectId");
CREATE INDEX "TeacherSubjectAssignment_schoolId_teacherId_idx" ON "TeacherSubjectAssignment"("schoolId", "teacherId");
CREATE INDEX "TeacherSubjectAssignment_schoolId_classId_idx" ON "TeacherSubjectAssignment"("schoolId", "classId");
CREATE INDEX "TeacherSubjectAssignment_schoolId_sectionId_idx" ON "TeacherSubjectAssignment"("schoolId", "sectionId");
CREATE INDEX "TeacherSubjectAssignment_schoolId_subjectId_idx" ON "TeacherSubjectAssignment"("schoolId", "subjectId");
CREATE INDEX "TeacherSubjectAssignment_schoolId_status_idx" ON "TeacherSubjectAssignment"("schoolId", "status");

ALTER TABLE "GuardianStudentLink" ADD CONSTRAINT "GuardianStudentLink_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianStudentLink" ADD CONSTRAINT "GuardianStudentLink_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianStudentLink" ADD CONSTRAINT "GuardianStudentLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherSubjectAssignment" ADD CONSTRAINT "TeacherSubjectAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
