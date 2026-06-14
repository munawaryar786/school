-- Phase 10: Attendance
ALTER TABLE "AttendanceRecord" ADD COLUMN "remarks" TEXT;

CREATE TABLE "AttendanceNotification" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "recipientType" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'PORTAL',
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AttendanceNotification_schoolId_status_idx" ON "AttendanceNotification"("schoolId", "status");
CREATE INDEX "AttendanceNotification_schoolId_recipientType_idx" ON "AttendanceNotification"("schoolId", "recipientType");
CREATE INDEX "AttendanceNotification_schoolId_createdAt_idx" ON "AttendanceNotification"("schoolId", "createdAt");

ALTER TABLE "AttendanceNotification" ADD CONSTRAINT "AttendanceNotification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
