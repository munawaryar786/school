-- Phase 15: Library
CREATE TABLE "LibraryIssue" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "bookTitle" TEXT NOT NULL,
  "isbn" TEXT NOT NULL,
  "borrowerName" TEXT NOT NULL,
  "borrowerType" TEXT NOT NULL,
  "issuedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueOn" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LibraryReturn" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "bookTitle" TEXT NOT NULL,
  "isbn" TEXT NOT NULL,
  "borrowerName" TEXT NOT NULL,
  "returnedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "condition" TEXT NOT NULL DEFAULT 'GOOD',
  "status" TEXT NOT NULL DEFAULT 'RETURNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryReturn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LibraryFine" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "borrowerName" TEXT NOT NULL,
  "bookTitle" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "issuedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryFine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LibraryIssue_schoolId_status_idx" ON "LibraryIssue"("schoolId", "status");
CREATE INDEX "LibraryIssue_schoolId_borrowerName_idx" ON "LibraryIssue"("schoolId", "borrowerName");
CREATE INDEX "LibraryIssue_schoolId_dueOn_idx" ON "LibraryIssue"("schoolId", "dueOn");
CREATE INDEX "LibraryReturn_schoolId_status_idx" ON "LibraryReturn"("schoolId", "status");
CREATE INDEX "LibraryReturn_schoolId_borrowerName_idx" ON "LibraryReturn"("schoolId", "borrowerName");
CREATE INDEX "LibraryReturn_schoolId_returnedOn_idx" ON "LibraryReturn"("schoolId", "returnedOn");
CREATE INDEX "LibraryFine_schoolId_status_idx" ON "LibraryFine"("schoolId", "status");
CREATE INDEX "LibraryFine_schoolId_borrowerName_idx" ON "LibraryFine"("schoolId", "borrowerName");
CREATE INDEX "LibraryFine_schoolId_issuedOn_idx" ON "LibraryFine"("schoolId", "issuedOn");

ALTER TABLE "LibraryIssue" ADD CONSTRAINT "LibraryIssue_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LibraryReturn" ADD CONSTRAINT "LibraryReturn_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LibraryFine" ADD CONSTRAINT "LibraryFine_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
