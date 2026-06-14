-- Phase 6: Student Portal
CREATE TABLE "StudentAssignmentSubmission" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "assignmentTitle" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "attachmentUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentAssignmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentOnlineExam" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "opensAt" TIMESTAMP(3) NOT NULL,
  "closesAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 45,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentOnlineExam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentOnlineExamAttempt" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "examTitle" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "answers" JSONB NOT NULL,
  "score" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentOnlineExamAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentCertificate" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "certificateNumber" TEXT NOT NULL,
  "issuedOn" TIMESTAMP(3) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentCertificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentTranscript" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "gpa" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentTranscript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentFeePayment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "feeTitle" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL DEFAULT 'ONLINE',
  "status" TEXT NOT NULL DEFAULT 'PAID',
  "receiptNumber" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentFeePayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudentAssignmentSubmission_schoolId_studentId_idx" ON "StudentAssignmentSubmission"("schoolId", "studentId");
CREATE INDEX "StudentAssignmentSubmission_schoolId_status_idx" ON "StudentAssignmentSubmission"("schoolId", "status");
CREATE INDEX "StudentAssignmentSubmission_schoolId_submittedAt_idx" ON "StudentAssignmentSubmission"("schoolId", "submittedAt");
CREATE INDEX "StudentOnlineExam_schoolId_className_idx" ON "StudentOnlineExam"("schoolId", "className");
CREATE INDEX "StudentOnlineExam_schoolId_status_idx" ON "StudentOnlineExam"("schoolId", "status");
CREATE INDEX "StudentOnlineExam_schoolId_opensAt_idx" ON "StudentOnlineExam"("schoolId", "opensAt");
CREATE INDEX "StudentOnlineExamAttempt_schoolId_studentId_idx" ON "StudentOnlineExamAttempt"("schoolId", "studentId");
CREATE INDEX "StudentOnlineExamAttempt_schoolId_status_idx" ON "StudentOnlineExamAttempt"("schoolId", "status");
CREATE INDEX "StudentOnlineExamAttempt_schoolId_submittedAt_idx" ON "StudentOnlineExamAttempt"("schoolId", "submittedAt");
CREATE UNIQUE INDEX "StudentCertificate_schoolId_certificateNumber_key" ON "StudentCertificate"("schoolId", "certificateNumber");
CREATE INDEX "StudentCertificate_schoolId_studentId_idx" ON "StudentCertificate"("schoolId", "studentId");
CREATE INDEX "StudentCertificate_schoolId_status_idx" ON "StudentCertificate"("schoolId", "status");
CREATE INDEX "StudentTranscript_schoolId_studentId_idx" ON "StudentTranscript"("schoolId", "studentId");
CREATE INDEX "StudentTranscript_schoolId_status_idx" ON "StudentTranscript"("schoolId", "status");
CREATE UNIQUE INDEX "StudentFeePayment_schoolId_receiptNumber_key" ON "StudentFeePayment"("schoolId", "receiptNumber");
CREATE INDEX "StudentFeePayment_schoolId_studentId_idx" ON "StudentFeePayment"("schoolId", "studentId");
CREATE INDEX "StudentFeePayment_schoolId_status_idx" ON "StudentFeePayment"("schoolId", "status");
CREATE INDEX "StudentFeePayment_schoolId_paidOn_idx" ON "StudentFeePayment"("schoolId", "paidOn");

ALTER TABLE "StudentAssignmentSubmission" ADD CONSTRAINT "StudentAssignmentSubmission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentAssignmentSubmission" ADD CONSTRAINT "StudentAssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentOnlineExam" ADD CONSTRAINT "StudentOnlineExam_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentOnlineExamAttempt" ADD CONSTRAINT "StudentOnlineExamAttempt_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentOnlineExamAttempt" ADD CONSTRAINT "StudentOnlineExamAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentCertificate" ADD CONSTRAINT "StudentCertificate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentCertificate" ADD CONSTRAINT "StudentCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentTranscript" ADD CONSTRAINT "StudentTranscript_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentTranscript" ADD CONSTRAINT "StudentTranscript_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentFeePayment" ADD CONSTRAINT "StudentFeePayment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentFeePayment" ADD CONSTRAINT "StudentFeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
