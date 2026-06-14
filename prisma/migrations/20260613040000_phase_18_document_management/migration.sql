-- Phase 18: Document Management
CREATE TABLE "DocumentStudent" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "uploadedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentStudent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentTeacher" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "uploadedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentTeacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentContract" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "partyName" TEXT NOT NULL,
  "contractType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "effectiveOn" TIMESTAMP(3) NOT NULL,
  "expiresOn" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentContract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentArchive" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "archiveType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "archivedBy" TEXT NOT NULL,
  "archivedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "retentionTag" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ARCHIVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentArchive_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DocumentStudent_schoolId_status_idx" ON "DocumentStudent"("schoolId", "status");
CREATE INDEX "DocumentStudent_schoolId_studentName_idx" ON "DocumentStudent"("schoolId", "studentName");
CREATE INDEX "DocumentStudent_schoolId_uploadedOn_idx" ON "DocumentStudent"("schoolId", "uploadedOn");
CREATE INDEX "DocumentTeacher_schoolId_status_idx" ON "DocumentTeacher"("schoolId", "status");
CREATE INDEX "DocumentTeacher_schoolId_teacherName_idx" ON "DocumentTeacher"("schoolId", "teacherName");
CREATE INDEX "DocumentTeacher_schoolId_uploadedOn_idx" ON "DocumentTeacher"("schoolId", "uploadedOn");
CREATE INDEX "DocumentContract_schoolId_status_idx" ON "DocumentContract"("schoolId", "status");
CREATE INDEX "DocumentContract_schoolId_partyName_idx" ON "DocumentContract"("schoolId", "partyName");
CREATE INDEX "DocumentContract_schoolId_effectiveOn_idx" ON "DocumentContract"("schoolId", "effectiveOn");
CREATE INDEX "DocumentArchive_schoolId_status_idx" ON "DocumentArchive"("schoolId", "status");
CREATE INDEX "DocumentArchive_schoolId_archiveType_idx" ON "DocumentArchive"("schoolId", "archiveType");
CREATE INDEX "DocumentArchive_schoolId_archivedOn_idx" ON "DocumentArchive"("schoolId", "archivedOn");

ALTER TABLE "DocumentStudent" ADD CONSTRAINT "DocumentStudent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentTeacher" ADD CONSTRAINT "DocumentTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentContract" ADD CONSTRAINT "DocumentContract_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentArchive" ADD CONSTRAINT "DocumentArchive_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
