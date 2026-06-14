-- Phase 17: Reports and Analytics
CREATE TABLE "StudentAnalyticsReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentAnalyticsReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherAnalyticsReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherAnalyticsReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceAnalyticsReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "personType" TEXT NOT NULL,
  "presentCount" INTEGER NOT NULL,
  "absentCount" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceAnalyticsReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancialAnalyticsReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "revenueAmount" INTEGER NOT NULL,
  "expenseAmount" INTEGER NOT NULL,
  "balanceAmount" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialAnalyticsReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsDashboard" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "audience" TEXT NOT NULL,
  "widgetCount" INTEGER NOT NULL DEFAULT 1,
  "refreshCadence" TEXT NOT NULL DEFAULT 'DAILY',
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalyticsDashboard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudentAnalyticsReport_schoolId_status_idx" ON "StudentAnalyticsReport"("schoolId", "status");
CREATE INDEX "StudentAnalyticsReport_schoolId_studentName_idx" ON "StudentAnalyticsReport"("schoolId", "studentName");
CREATE INDEX "StudentAnalyticsReport_schoolId_academicYear_idx" ON "StudentAnalyticsReport"("schoolId", "academicYear");
CREATE INDEX "TeacherAnalyticsReport_schoolId_status_idx" ON "TeacherAnalyticsReport"("schoolId", "status");
CREATE INDEX "TeacherAnalyticsReport_schoolId_teacherName_idx" ON "TeacherAnalyticsReport"("schoolId", "teacherName");
CREATE INDEX "TeacherAnalyticsReport_schoolId_department_idx" ON "TeacherAnalyticsReport"("schoolId", "department");
CREATE INDEX "AttendanceAnalyticsReport_schoolId_status_idx" ON "AttendanceAnalyticsReport"("schoolId", "status");
CREATE INDEX "AttendanceAnalyticsReport_schoolId_period_idx" ON "AttendanceAnalyticsReport"("schoolId", "period");
CREATE INDEX "AttendanceAnalyticsReport_schoolId_personType_idx" ON "AttendanceAnalyticsReport"("schoolId", "personType");
CREATE INDEX "FinancialAnalyticsReport_schoolId_status_idx" ON "FinancialAnalyticsReport"("schoolId", "status");
CREATE INDEX "FinancialAnalyticsReport_schoolId_period_idx" ON "FinancialAnalyticsReport"("schoolId", "period");
CREATE INDEX "AnalyticsDashboard_schoolId_status_idx" ON "AnalyticsDashboard"("schoolId", "status");
CREATE INDEX "AnalyticsDashboard_schoolId_audience_idx" ON "AnalyticsDashboard"("schoolId", "audience");

ALTER TABLE "StudentAnalyticsReport" ADD CONSTRAINT "StudentAnalyticsReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAnalyticsReport" ADD CONSTRAINT "TeacherAnalyticsReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceAnalyticsReport" ADD CONSTRAINT "AttendanceAnalyticsReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancialAnalyticsReport" ADD CONSTRAINT "FinancialAnalyticsReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsDashboard" ADD CONSTRAINT "AnalyticsDashboard_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
