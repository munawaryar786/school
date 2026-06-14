CREATE TABLE "UserTwoFactorSetting" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "schoolId" TEXT,
  "secretEncrypted" TEXT NOT NULL,
  "algorithm" TEXT NOT NULL DEFAULT 'TOTP_SHA1',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "recoveryCodes" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserTwoFactorSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecuritySecret" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "key" TEXT NOT NULL,
  "encryptedValue" TEXT NOT NULL,
  "iv" TEXT NOT NULL,
  "authTag" TEXT NOT NULL,
  "algorithm" TEXT NOT NULL DEFAULT 'AES-256-GCM',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "rotatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SecuritySecret_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiSecurityRule" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "name" TEXT NOT NULL,
  "ruleType" TEXT NOT NULL,
  "pattern" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApiSecurityRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityBackupPolicy" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "name" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "retentionDays" INTEGER NOT NULL DEFAULT 30,
  "storageTarget" TEXT NOT NULL,
  "encryptionEnabled" BOOLEAN NOT NULL DEFAULT true,
  "lastBackupAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SecurityBackupPolicy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserTwoFactorSetting_userId_schoolId_key" ON "UserTwoFactorSetting"("userId", "schoolId");
CREATE INDEX "UserTwoFactorSetting_schoolId_status_idx" ON "UserTwoFactorSetting"("schoolId", "status");
CREATE INDEX "UserTwoFactorSetting_userId_enabled_idx" ON "UserTwoFactorSetting"("userId", "enabled");

CREATE UNIQUE INDEX "SecuritySecret_schoolId_key_key" ON "SecuritySecret"("schoolId", "key");
CREATE INDEX "SecuritySecret_schoolId_status_idx" ON "SecuritySecret"("schoolId", "status");
CREATE INDEX "SecuritySecret_key_idx" ON "SecuritySecret"("key");

CREATE UNIQUE INDEX "ApiSecurityRule_schoolId_name_key" ON "ApiSecurityRule"("schoolId", "name");
CREATE INDEX "ApiSecurityRule_schoolId_status_idx" ON "ApiSecurityRule"("schoolId", "status");
CREATE INDEX "ApiSecurityRule_ruleType_idx" ON "ApiSecurityRule"("ruleType");
CREATE INDEX "ApiSecurityRule_severity_idx" ON "ApiSecurityRule"("severity");

CREATE UNIQUE INDEX "SecurityBackupPolicy_schoolId_name_key" ON "SecurityBackupPolicy"("schoolId", "name");
CREATE INDEX "SecurityBackupPolicy_schoolId_status_idx" ON "SecurityBackupPolicy"("schoolId", "status");
CREATE INDEX "SecurityBackupPolicy_frequency_idx" ON "SecurityBackupPolicy"("frequency");

ALTER TABLE "UserTwoFactorSetting" ADD CONSTRAINT "UserTwoFactorSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserTwoFactorSetting" ADD CONSTRAINT "UserTwoFactorSetting_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecuritySecret" ADD CONSTRAINT "SecuritySecret_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiSecurityRule" ADD CONSTRAINT "ApiSecurityRule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityBackupPolicy" ADD CONSTRAINT "SecurityBackupPolicy_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
