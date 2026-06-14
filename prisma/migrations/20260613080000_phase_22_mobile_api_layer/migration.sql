CREATE TABLE "MobileDevice" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "deviceToken" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "appVersion" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MobileDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MobileSyncLog" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "syncType" TEXT NOT NULL,
  "recordsSynced" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MobileSyncLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MobileDevice_schoolId_deviceToken_key" ON "MobileDevice"("schoolId", "deviceToken");
CREATE INDEX "MobileDevice_schoolId_role_idx" ON "MobileDevice"("schoolId", "role");
CREATE INDEX "MobileDevice_schoolId_status_idx" ON "MobileDevice"("schoolId", "status");
CREATE INDEX "MobileDevice_schoolId_userEmail_idx" ON "MobileDevice"("schoolId", "userEmail");
CREATE INDEX "MobileDevice_schoolId_lastSeenAt_idx" ON "MobileDevice"("schoolId", "lastSeenAt");

CREATE INDEX "MobileSyncLog_schoolId_role_idx" ON "MobileSyncLog"("schoolId", "role");
CREATE INDEX "MobileSyncLog_schoolId_status_idx" ON "MobileSyncLog"("schoolId", "status");
CREATE INDEX "MobileSyncLog_schoolId_userEmail_idx" ON "MobileSyncLog"("schoolId", "userEmail");
CREATE INDEX "MobileSyncLog_schoolId_syncedAt_idx" ON "MobileSyncLog"("schoolId", "syncedAt");

ALTER TABLE "MobileDevice" ADD CONSTRAINT "MobileDevice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MobileSyncLog" ADD CONSTRAINT "MobileSyncLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
