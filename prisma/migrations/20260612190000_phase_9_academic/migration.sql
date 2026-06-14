-- Phase 9: Academic
CREATE TABLE "AcademicTerm" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startsOn" TIMESTAMP(3) NOT NULL,
  "endsOn" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CurriculumPlan" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "objectives" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CurriculumPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcademicTerm_schoolId_academicYear_name_key" ON "AcademicTerm"("schoolId", "academicYear", "name");
CREATE INDEX "AcademicTerm_schoolId_status_idx" ON "AcademicTerm"("schoolId", "status");
CREATE INDEX "AcademicTerm_schoolId_startsOn_idx" ON "AcademicTerm"("schoolId", "startsOn");
CREATE INDEX "CurriculumPlan_schoolId_status_idx" ON "CurriculumPlan"("schoolId", "status");
CREATE INDEX "CurriculumPlan_schoolId_className_idx" ON "CurriculumPlan"("schoolId", "className");
CREATE INDEX "CurriculumPlan_schoolId_academicYear_idx" ON "CurriculumPlan"("schoolId", "academicYear");

ALTER TABLE "AcademicTerm" ADD CONSTRAINT "AcademicTerm_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CurriculumPlan" ADD CONSTRAINT "CurriculumPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
