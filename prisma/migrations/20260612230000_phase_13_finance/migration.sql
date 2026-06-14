-- Phase 13: Fees and Finance
CREATE TABLE "FinanceInvoice" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "feeTitle" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancePayment" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "payerName" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL DEFAULT 'ONLINE',
  "status" TEXT NOT NULL DEFAULT 'PAID',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceScholarship" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "academicYear" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceScholarship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceDiscount" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "feeTitle" TEXT NOT NULL,
  "discountType" TEXT NOT NULL DEFAULT 'MERIT',
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceDiscount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceReport" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinanceInvoice_schoolId_invoiceNumber_key" ON "FinanceInvoice"("schoolId", "invoiceNumber");
CREATE UNIQUE INDEX "FinancePayment_schoolId_receiptNumber_key" ON "FinancePayment"("schoolId", "receiptNumber");
CREATE INDEX "FinanceInvoice_schoolId_status_idx" ON "FinanceInvoice"("schoolId", "status");
CREATE INDEX "FinanceInvoice_schoolId_dueDate_idx" ON "FinanceInvoice"("schoolId", "dueDate");
CREATE INDEX "FinanceInvoice_schoolId_studentName_idx" ON "FinanceInvoice"("schoolId", "studentName");
CREATE INDEX "FinancePayment_schoolId_status_idx" ON "FinancePayment"("schoolId", "status");
CREATE INDEX "FinancePayment_schoolId_paidOn_idx" ON "FinancePayment"("schoolId", "paidOn");
CREATE INDEX "FinancePayment_schoolId_studentName_idx" ON "FinancePayment"("schoolId", "studentName");
CREATE INDEX "FinanceScholarship_schoolId_status_idx" ON "FinanceScholarship"("schoolId", "status");
CREATE INDEX "FinanceScholarship_schoolId_studentName_idx" ON "FinanceScholarship"("schoolId", "studentName");
CREATE INDEX "FinanceScholarship_schoolId_academicYear_idx" ON "FinanceScholarship"("schoolId", "academicYear");
CREATE INDEX "FinanceDiscount_schoolId_status_idx" ON "FinanceDiscount"("schoolId", "status");
CREATE INDEX "FinanceDiscount_schoolId_studentName_idx" ON "FinanceDiscount"("schoolId", "studentName");
CREATE INDEX "FinanceDiscount_schoolId_feeTitle_idx" ON "FinanceDiscount"("schoolId", "feeTitle");
CREATE INDEX "FinanceReport_schoolId_status_idx" ON "FinanceReport"("schoolId", "status");
CREATE INDEX "FinanceReport_schoolId_period_idx" ON "FinanceReport"("schoolId", "period");
CREATE INDEX "FinanceReport_schoolId_metric_idx" ON "FinanceReport"("schoolId", "metric");

ALTER TABLE "FinanceInvoice" ADD CONSTRAINT "FinanceInvoice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceScholarship" ADD CONSTRAINT "FinanceScholarship_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceDiscount" ADD CONSTRAINT "FinanceDiscount_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceReport" ADD CONSTRAINT "FinanceReport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
