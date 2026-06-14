-- Phase 19: Certificate Management
CREATE TABLE "CertificateRecord" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "certificateNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "issuedOn" TIMESTAMP(3) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TranscriptRecord" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "transcriptNumber" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "gpa" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TranscriptRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificateVerification" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "verificationCode" TEXT NOT NULL,
  "certificateNumber" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "verifiedOn" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'VALID',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CertificateRecord_schoolId_certificateNumber_key" ON "CertificateRecord"("schoolId", "certificateNumber");
CREATE UNIQUE INDEX "TranscriptRecord_schoolId_transcriptNumber_key" ON "TranscriptRecord"("schoolId", "transcriptNumber");
CREATE UNIQUE INDEX "CertificateVerification_schoolId_verificationCode_key" ON "CertificateVerification"("schoolId", "verificationCode");
CREATE INDEX "CertificateRecord_schoolId_status_idx" ON "CertificateRecord"("schoolId", "status");
CREATE INDEX "CertificateRecord_schoolId_studentName_idx" ON "CertificateRecord"("schoolId", "studentName");
CREATE INDEX "CertificateRecord_schoolId_issuedOn_idx" ON "CertificateRecord"("schoolId", "issuedOn");
CREATE INDEX "TranscriptRecord_schoolId_status_idx" ON "TranscriptRecord"("schoolId", "status");
CREATE INDEX "TranscriptRecord_schoolId_studentName_idx" ON "TranscriptRecord"("schoolId", "studentName");
CREATE INDEX "TranscriptRecord_schoolId_academicYear_idx" ON "TranscriptRecord"("schoolId", "academicYear");
CREATE INDEX "CertificateVerification_schoolId_status_idx" ON "CertificateVerification"("schoolId", "status");
CREATE INDEX "CertificateVerification_schoolId_certificateNumber_idx" ON "CertificateVerification"("schoolId", "certificateNumber");
CREATE INDEX "CertificateVerification_schoolId_studentName_idx" ON "CertificateVerification"("schoolId", "studentName");

ALTER TABLE "CertificateRecord" ADD CONSTRAINT "CertificateRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TranscriptRecord" ADD CONSTRAINT "TranscriptRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CertificateVerification" ADD CONSTRAINT "CertificateVerification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
