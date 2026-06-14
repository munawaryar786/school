CREATE TABLE "PerformanceCheck" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "area" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "unit" TEXT NOT NULL,
  "threshold" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PerformanceCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessibilityAudit" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "page" TEXT NOT NULL,
  "rule" TEXT NOT NULL,
  "impact" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccessibilityAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoCheck" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "page" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "canonical" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ErrorMonitoringEvent" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "source" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'ERROR',
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ErrorMonitoringEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeploymentCheck" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "environment" TEXT NOT NULL,
  "checkName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeploymentCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoadTestResult" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "scenario" TEXT NOT NULL,
  "virtualUsers" INTEGER NOT NULL,
  "durationSeconds" INTEGER NOT NULL,
  "requestsPerSecond" INTEGER NOT NULL,
  "p95Ms" INTEGER NOT NULL,
  "errorRate" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoadTestResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegressionCheck" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "suite" TEXT NOT NULL,
  "checkName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RegressionCheck_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PerformanceCheck_schoolId_status_idx" ON "PerformanceCheck"("schoolId", "status");
CREATE INDEX "PerformanceCheck_area_idx" ON "PerformanceCheck"("area");
CREATE INDEX "PerformanceCheck_checkedAt_idx" ON "PerformanceCheck"("checkedAt");

CREATE INDEX "AccessibilityAudit_schoolId_status_idx" ON "AccessibilityAudit"("schoolId", "status");
CREATE INDEX "AccessibilityAudit_page_idx" ON "AccessibilityAudit"("page");
CREATE INDEX "AccessibilityAudit_impact_idx" ON "AccessibilityAudit"("impact");

CREATE INDEX "SeoCheck_schoolId_status_idx" ON "SeoCheck"("schoolId", "status");
CREATE INDEX "SeoCheck_page_idx" ON "SeoCheck"("page");

CREATE INDEX "ErrorMonitoringEvent_schoolId_status_idx" ON "ErrorMonitoringEvent"("schoolId", "status");
CREATE INDEX "ErrorMonitoringEvent_severity_idx" ON "ErrorMonitoringEvent"("severity");
CREATE INDEX "ErrorMonitoringEvent_occurredAt_idx" ON "ErrorMonitoringEvent"("occurredAt");

CREATE INDEX "DeploymentCheck_schoolId_status_idx" ON "DeploymentCheck"("schoolId", "status");
CREATE INDEX "DeploymentCheck_environment_idx" ON "DeploymentCheck"("environment");
CREATE INDEX "DeploymentCheck_checkedAt_idx" ON "DeploymentCheck"("checkedAt");

CREATE INDEX "LoadTestResult_schoolId_status_idx" ON "LoadTestResult"("schoolId", "status");
CREATE INDEX "LoadTestResult_scenario_idx" ON "LoadTestResult"("scenario");
CREATE INDEX "LoadTestResult_testedAt_idx" ON "LoadTestResult"("testedAt");

CREATE INDEX "RegressionCheck_schoolId_status_idx" ON "RegressionCheck"("schoolId", "status");
CREATE INDEX "RegressionCheck_suite_idx" ON "RegressionCheck"("suite");
CREATE INDEX "RegressionCheck_checkedAt_idx" ON "RegressionCheck"("checkedAt");

ALTER TABLE "PerformanceCheck" ADD CONSTRAINT "PerformanceCheck_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessibilityAudit" ADD CONSTRAINT "AccessibilityAudit_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeoCheck" ADD CONSTRAINT "SeoCheck_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ErrorMonitoringEvent" ADD CONSTRAINT "ErrorMonitoringEvent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeploymentCheck" ADD CONSTRAINT "DeploymentCheck_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoadTestResult" ADD CONSTRAINT "LoadTestResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RegressionCheck" ADD CONSTRAINT "RegressionCheck_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
