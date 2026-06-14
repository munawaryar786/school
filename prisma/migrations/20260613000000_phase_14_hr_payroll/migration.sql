-- Phase 14: HR and Payroll
CREATE TABLE "HrEmployee" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "employeeNumber" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "joiningDate" TIMESTAMP(3) NOT NULL,
  "salary" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HrEmployee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HrLeave" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "leaveType" TEXT NOT NULL,
  "startsOn" TIMESTAMP(3) NOT NULL,
  "endsOn" TIMESTAMP(3) NOT NULL,
  "days" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HrLeave_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HrPayroll" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "payrollMonth" TEXT NOT NULL,
  "basicSalary" INTEGER NOT NULL,
  "allowances" INTEGER NOT NULL DEFAULT 0,
  "deductions" INTEGER NOT NULL DEFAULT 0,
  "netSalary" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HrPayroll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HrSalarySlip" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "slipNumber" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "payrollMonth" TEXT NOT NULL,
  "netSalary" INTEGER NOT NULL,
  "fileUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HrSalarySlip_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HrEmployee_schoolId_employeeNumber_key" ON "HrEmployee"("schoolId", "employeeNumber");
CREATE UNIQUE INDEX "HrEmployee_schoolId_email_key" ON "HrEmployee"("schoolId", "email");
CREATE UNIQUE INDEX "HrSalarySlip_schoolId_slipNumber_key" ON "HrSalarySlip"("schoolId", "slipNumber");
CREATE INDEX "HrEmployee_schoolId_status_idx" ON "HrEmployee"("schoolId", "status");
CREATE INDEX "HrEmployee_schoolId_department_idx" ON "HrEmployee"("schoolId", "department");
CREATE INDEX "HrLeave_schoolId_status_idx" ON "HrLeave"("schoolId", "status");
CREATE INDEX "HrLeave_schoolId_employeeName_idx" ON "HrLeave"("schoolId", "employeeName");
CREATE INDEX "HrLeave_schoolId_startsOn_idx" ON "HrLeave"("schoolId", "startsOn");
CREATE INDEX "HrPayroll_schoolId_status_idx" ON "HrPayroll"("schoolId", "status");
CREATE INDEX "HrPayroll_schoolId_employeeName_idx" ON "HrPayroll"("schoolId", "employeeName");
CREATE INDEX "HrPayroll_schoolId_payrollMonth_idx" ON "HrPayroll"("schoolId", "payrollMonth");
CREATE INDEX "HrSalarySlip_schoolId_status_idx" ON "HrSalarySlip"("schoolId", "status");
CREATE INDEX "HrSalarySlip_schoolId_employeeName_idx" ON "HrSalarySlip"("schoolId", "employeeName");
CREATE INDEX "HrSalarySlip_schoolId_payrollMonth_idx" ON "HrSalarySlip"("schoolId", "payrollMonth");

ALTER TABLE "HrEmployee" ADD CONSTRAINT "HrEmployee_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrLeave" ADD CONSTRAINT "HrLeave_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrPayroll" ADD CONSTRAINT "HrPayroll_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrSalarySlip" ADD CONSTRAINT "HrSalarySlip_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
