-- Phase 11: Examination
CREATE TABLE "ExaminationSchedule" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "examDate" TIMESTAMP(3) NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExaminationSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionBankItem" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "questionType" TEXT NOT NULL DEFAULT 'MCQ',
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "marks" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionBankItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExaminationOnlineExam" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "opensAt" TIMESTAMP(3) NOT NULL,
  "closesAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 45,
  "totalMarks" INTEGER NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExaminationOnlineExam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExaminationResult" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "examTitle" TEXT NOT NULL,
  "marksObtained" INTEGER NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "grade" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECORDED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExaminationResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportCard" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "totalMarks" INTEGER NOT NULL,
  "obtainedMarks" INTEGER NOT NULL,
  "grade" TEXT NOT NULL,
  "fileUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExaminationSchedule_schoolId_status_idx" ON "ExaminationSchedule"("schoolId", "status");
CREATE INDEX "ExaminationSchedule_schoolId_examDate_idx" ON "ExaminationSchedule"("schoolId", "examDate");
CREATE INDEX "QuestionBankItem_schoolId_status_idx" ON "QuestionBankItem"("schoolId", "status");
CREATE INDEX "QuestionBankItem_schoolId_subject_idx" ON "QuestionBankItem"("schoolId", "subject");
CREATE INDEX "QuestionBankItem_schoolId_className_idx" ON "QuestionBankItem"("schoolId", "className");
CREATE INDEX "ExaminationOnlineExam_schoolId_status_idx" ON "ExaminationOnlineExam"("schoolId", "status");
CREATE INDEX "ExaminationOnlineExam_schoolId_opensAt_idx" ON "ExaminationOnlineExam"("schoolId", "opensAt");
CREATE INDEX "ExaminationOnlineExam_schoolId_className_idx" ON "ExaminationOnlineExam"("schoolId", "className");
CREATE INDEX "ExaminationResult_schoolId_status_idx" ON "ExaminationResult"("schoolId", "status");
CREATE INDEX "ExaminationResult_schoolId_studentName_idx" ON "ExaminationResult"("schoolId", "studentName");
CREATE INDEX "ExaminationResult_schoolId_className_idx" ON "ExaminationResult"("schoolId", "className");
CREATE INDEX "ReportCard_schoolId_status_idx" ON "ReportCard"("schoolId", "status");
CREATE INDEX "ReportCard_schoolId_studentName_idx" ON "ReportCard"("schoolId", "studentName");
CREATE INDEX "ReportCard_schoolId_academicYear_idx" ON "ReportCard"("schoolId", "academicYear");

ALTER TABLE "ExaminationSchedule" ADD CONSTRAINT "ExaminationSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionBankItem" ADD CONSTRAINT "QuestionBankItem_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExaminationOnlineExam" ADD CONSTRAINT "ExaminationOnlineExam_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExaminationResult" ADD CONSTRAINT "ExaminationResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
