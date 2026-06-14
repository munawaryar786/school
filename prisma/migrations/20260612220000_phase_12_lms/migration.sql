-- Phase 12: LMS
CREATE TABLE "LmsCourse" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "instructorName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LmsCourse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LmsMaterial" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "materialType" TEXT NOT NULL DEFAULT 'PDF',
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LmsMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LmsVideo" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 10,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LmsVideo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LmsQuiz" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "totalMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LmsQuiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LmsProgress" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "completedLessons" INTEGER NOT NULL DEFAULT 0,
  "totalLessons" INTEGER NOT NULL DEFAULT 1,
  "progressPercent" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LmsProgress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LmsCourse_schoolId_status_idx" ON "LmsCourse"("schoolId", "status");
CREATE INDEX "LmsCourse_schoolId_className_idx" ON "LmsCourse"("schoolId", "className");
CREATE INDEX "LmsCourse_schoolId_subject_idx" ON "LmsCourse"("schoolId", "subject");
CREATE INDEX "LmsMaterial_schoolId_status_idx" ON "LmsMaterial"("schoolId", "status");
CREATE INDEX "LmsMaterial_schoolId_courseTitle_idx" ON "LmsMaterial"("schoolId", "courseTitle");
CREATE INDEX "LmsMaterial_schoolId_className_idx" ON "LmsMaterial"("schoolId", "className");
CREATE INDEX "LmsVideo_schoolId_status_idx" ON "LmsVideo"("schoolId", "status");
CREATE INDEX "LmsVideo_schoolId_courseTitle_idx" ON "LmsVideo"("schoolId", "courseTitle");
CREATE INDEX "LmsVideo_schoolId_className_idx" ON "LmsVideo"("schoolId", "className");
CREATE INDEX "LmsQuiz_schoolId_status_idx" ON "LmsQuiz"("schoolId", "status");
CREATE INDEX "LmsQuiz_schoolId_dueDate_idx" ON "LmsQuiz"("schoolId", "dueDate");
CREATE INDEX "LmsQuiz_schoolId_className_idx" ON "LmsQuiz"("schoolId", "className");
CREATE INDEX "LmsProgress_schoolId_status_idx" ON "LmsProgress"("schoolId", "status");
CREATE INDEX "LmsProgress_schoolId_studentName_idx" ON "LmsProgress"("schoolId", "studentName");
CREATE INDEX "LmsProgress_schoolId_courseTitle_idx" ON "LmsProgress"("schoolId", "courseTitle");

ALTER TABLE "LmsCourse" ADD CONSTRAINT "LmsCourse_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LmsMaterial" ADD CONSTRAINT "LmsMaterial_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LmsVideo" ADD CONSTRAINT "LmsVideo_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LmsQuiz" ADD CONSTRAINT "LmsQuiz_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LmsProgress" ADD CONSTRAINT "LmsProgress_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
