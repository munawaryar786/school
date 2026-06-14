-- Phase 8: Admissions
CREATE TABLE "AdmissionApplication" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationNo" TEXT NOT NULL,
  "applicantName" TEXT NOT NULL,
  "guardianName" TEXT NOT NULL,
  "guardianPhone" TEXT NOT NULL,
  "desiredClass" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'ONLINE',
  "appliedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdmissionEnrollment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "enrollmentNo" TEXT NOT NULL,
  "enrolledOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'ENROLLED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdmissionDocument" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "applicationId" TEXT,
  "applicantName" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "uploadedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdmissionReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdmissionReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdmissionApplication_schoolId_applicationNo_key" ON "AdmissionApplication"("schoolId", "applicationNo");
CREATE INDEX "AdmissionApplication_schoolId_status_idx" ON "AdmissionApplication"("schoolId", "status");
CREATE INDEX "AdmissionApplication_schoolId_appliedOn_idx" ON "AdmissionApplication"("schoolId", "appliedOn");
CREATE UNIQUE INDEX "AdmissionEnrollment_schoolId_enrollmentNo_key" ON "AdmissionEnrollment"("schoolId", "enrollmentNo");
CREATE INDEX "AdmissionEnrollment_schoolId_status_idx" ON "AdmissionEnrollment"("schoolId", "status");
CREATE INDEX "AdmissionEnrollment_schoolId_enrolledOn_idx" ON "AdmissionEnrollment"("schoolId", "enrolledOn");
CREATE INDEX "AdmissionDocument_schoolId_status_idx" ON "AdmissionDocument"("schoolId", "status");
CREATE INDEX "AdmissionDocument_schoolId_uploadedOn_idx" ON "AdmissionDocument"("schoolId", "uploadedOn");
CREATE INDEX "AdmissionReport_schoolId_status_idx" ON "AdmissionReport"("schoolId", "status");
CREATE INDEX "AdmissionReport_schoolId_period_idx" ON "AdmissionReport"("schoolId", "period");

ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdmissionEnrollment" ADD CONSTRAINT "AdmissionEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdmissionEnrollment" ADD CONSTRAINT "AdmissionEnrollment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdmissionDocument" ADD CONSTRAINT "AdmissionDocument_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdmissionDocument" ADD CONSTRAINT "AdmissionDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdmissionReport" ADD CONSTRAINT "AdmissionReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
