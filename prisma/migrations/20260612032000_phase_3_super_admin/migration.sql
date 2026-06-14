CREATE TYPE "SchoolStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE "BackupStatus" AS ENUM ('COMPLETED', 'FAILED', 'RESTORED');

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CREATE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'UPDATE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DELETE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'EXPORT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BACKUP';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'RESTORE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATE';

ALTER TABLE "School" ADD COLUMN "address" TEXT;
ALTER TABLE "School" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "School" ADD COLUMN "email" TEXT;
ALTER TABLE "School" ADD COLUMN "phone" TEXT;
ALTER TABLE "School" ADD COLUMN "website" TEXT;
ALTER TABLE "School" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "School" ALTER COLUMN "status" TYPE "SchoolStatus" USING "status"::"SchoolStatus";
ALTER TABLE "School" ALTER COLUMN "status" SET DEFAULT 'TRIAL';

CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyAmount" INTEGER NOT NULL,
    "annualAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BackupJob" (
    "id" TEXT NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'COMPLETED',
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdById" TEXT,
    "restoredAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BackupJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
CREATE INDEX "Subscription_schoolId_idx" ON "Subscription"("schoolId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_currentPeriodStart_idx" ON "Subscription"("currentPeriodStart");
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");
CREATE INDEX "BackupJob_status_idx" ON "BackupJob"("status");
CREATE INDEX "BackupJob_createdAt_idx" ON "BackupJob"("createdAt");
CREATE INDEX "School_status_idx" ON "School"("status");
CREATE INDEX "School_deletedAt_idx" ON "School"("deletedAt");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
