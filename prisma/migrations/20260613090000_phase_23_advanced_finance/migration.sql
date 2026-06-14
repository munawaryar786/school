CREATE TABLE "GeneralLedgerEntry" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "entryNumber" TEXT NOT NULL,
  "accountCode" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "entryDate" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "debitAmount" INTEGER NOT NULL DEFAULT 0,
  "creditAmount" INTEGER NOT NULL DEFAULT 0,
  "referenceType" TEXT NOT NULL,
  "referenceNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'POSTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneralLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChartOfAccount" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "accountCode" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountType" TEXT NOT NULL,
  "parentCode" TEXT,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetRecord" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "budgetCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "budgetAmount" INTEGER NOT NULL,
  "spentAmount" INTEGER NOT NULL DEFAULT 0,
  "ownerName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BudgetRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseRecord" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "expenseNumber" TEXT NOT NULL,
  "vendorName" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "expenseDate" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExpenseRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancialStatement" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "statementNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "statementType" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "revenueAmount" INTEGER NOT NULL,
  "expenseAmount" INTEGER NOT NULL,
  "netAmount" INTEGER NOT NULL,
  "preparedBy" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialStatement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GeneralLedgerEntry_schoolId_entryNumber_key" ON "GeneralLedgerEntry"("schoolId", "entryNumber");
CREATE INDEX "GeneralLedgerEntry_schoolId_accountCode_idx" ON "GeneralLedgerEntry"("schoolId", "accountCode");
CREATE INDEX "GeneralLedgerEntry_schoolId_status_idx" ON "GeneralLedgerEntry"("schoolId", "status");
CREATE INDEX "GeneralLedgerEntry_schoolId_entryDate_idx" ON "GeneralLedgerEntry"("schoolId", "entryDate");

CREATE UNIQUE INDEX "ChartOfAccount_schoolId_accountCode_key" ON "ChartOfAccount"("schoolId", "accountCode");
CREATE INDEX "ChartOfAccount_schoolId_accountType_idx" ON "ChartOfAccount"("schoolId", "accountType");
CREATE INDEX "ChartOfAccount_schoolId_status_idx" ON "ChartOfAccount"("schoolId", "status");

CREATE UNIQUE INDEX "BudgetRecord_schoolId_budgetCode_key" ON "BudgetRecord"("schoolId", "budgetCode");
CREATE INDEX "BudgetRecord_schoolId_department_idx" ON "BudgetRecord"("schoolId", "department");
CREATE INDEX "BudgetRecord_schoolId_fiscalYear_idx" ON "BudgetRecord"("schoolId", "fiscalYear");
CREATE INDEX "BudgetRecord_schoolId_status_idx" ON "BudgetRecord"("schoolId", "status");

CREATE UNIQUE INDEX "ExpenseRecord_schoolId_expenseNumber_key" ON "ExpenseRecord"("schoolId", "expenseNumber");
CREATE INDEX "ExpenseRecord_schoolId_department_idx" ON "ExpenseRecord"("schoolId", "department");
CREATE INDEX "ExpenseRecord_schoolId_category_idx" ON "ExpenseRecord"("schoolId", "category");
CREATE INDEX "ExpenseRecord_schoolId_status_idx" ON "ExpenseRecord"("schoolId", "status");
CREATE INDEX "ExpenseRecord_schoolId_expenseDate_idx" ON "ExpenseRecord"("schoolId", "expenseDate");

CREATE UNIQUE INDEX "FinancialStatement_schoolId_statementNumber_key" ON "FinancialStatement"("schoolId", "statementNumber");
CREATE INDEX "FinancialStatement_schoolId_statementType_idx" ON "FinancialStatement"("schoolId", "statementType");
CREATE INDEX "FinancialStatement_schoolId_period_idx" ON "FinancialStatement"("schoolId", "period");
CREATE INDEX "FinancialStatement_schoolId_status_idx" ON "FinancialStatement"("schoolId", "status");

ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetRecord" ADD CONSTRAINT "BudgetRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinancialStatement" ADD CONSTRAINT "FinancialStatement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
