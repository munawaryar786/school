-- Phase 7: Parent Portal
CREATE TABLE "ParentFeePayment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "parentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "feeTitle" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL DEFAULT 'ONLINE',
  "status" TEXT NOT NULL DEFAULT 'PAID',
  "receiptNumber" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ParentFeePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParentPortalMessage" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "parentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'PORTAL',
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ParentPortalMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ParentFeePayment_schoolId_receiptNumber_key" ON "ParentFeePayment"("schoolId", "receiptNumber");
CREATE INDEX "ParentFeePayment_schoolId_parentId_idx" ON "ParentFeePayment"("schoolId", "parentId");
CREATE INDEX "ParentFeePayment_schoolId_status_idx" ON "ParentFeePayment"("schoolId", "status");
CREATE INDEX "ParentFeePayment_schoolId_paidOn_idx" ON "ParentFeePayment"("schoolId", "paidOn");
CREATE INDEX "ParentPortalMessage_schoolId_parentId_idx" ON "ParentPortalMessage"("schoolId", "parentId");
CREATE INDEX "ParentPortalMessage_schoolId_status_idx" ON "ParentPortalMessage"("schoolId", "status");
CREATE INDEX "ParentPortalMessage_schoolId_createdAt_idx" ON "ParentPortalMessage"("schoolId", "createdAt");

ALTER TABLE "ParentFeePayment" ADD CONSTRAINT "ParentFeePayment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentFeePayment" ADD CONSTRAINT "ParentFeePayment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentPortalMessage" ADD CONSTRAINT "ParentPortalMessage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentPortalMessage" ADD CONSTRAINT "ParentPortalMessage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
