CREATE TABLE "MeetingSchedule" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "meetingType" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "location" TEXT NOT NULL,
  "organizerName" TEXT NOT NULL,
  "agenda" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingMinute" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "meetingTitle" TEXT NOT NULL,
  "recordedBy" TEXT NOT NULL,
  "heldOn" TIMESTAMP(3) NOT NULL,
  "summary" TEXT NOT NULL,
  "decisions" TEXT NOT NULL,
  "actionItems" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECORDED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingMinute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingRecord" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "meetingType" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "attendees" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetingSchedule_schoolId_title_scheduledFor_key" ON "MeetingSchedule"("schoolId", "title", "scheduledFor");
CREATE INDEX "MeetingSchedule_schoolId_status_idx" ON "MeetingSchedule"("schoolId", "status");
CREATE INDEX "MeetingSchedule_schoolId_meetingType_idx" ON "MeetingSchedule"("schoolId", "meetingType");
CREATE INDEX "MeetingSchedule_schoolId_scheduledFor_idx" ON "MeetingSchedule"("schoolId", "scheduledFor");

CREATE UNIQUE INDEX "MeetingMinute_schoolId_meetingTitle_heldOn_key" ON "MeetingMinute"("schoolId", "meetingTitle", "heldOn");
CREATE INDEX "MeetingMinute_schoolId_status_idx" ON "MeetingMinute"("schoolId", "status");
CREATE INDEX "MeetingMinute_schoolId_recordedBy_idx" ON "MeetingMinute"("schoolId", "recordedBy");
CREATE INDEX "MeetingMinute_schoolId_heldOn_idx" ON "MeetingMinute"("schoolId", "heldOn");

CREATE UNIQUE INDEX "MeetingRecord_schoolId_title_startsAt_key" ON "MeetingRecord"("schoolId", "title", "startsAt");
CREATE INDEX "MeetingRecord_schoolId_status_idx" ON "MeetingRecord"("schoolId", "status");
CREATE INDEX "MeetingRecord_schoolId_meetingType_idx" ON "MeetingRecord"("schoolId", "meetingType");
CREATE INDEX "MeetingRecord_schoolId_startsAt_idx" ON "MeetingRecord"("schoolId", "startsAt");

ALTER TABLE "MeetingSchedule" ADD CONSTRAINT "MeetingSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingMinute" ADD CONSTRAINT "MeetingMinute_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingRecord" ADD CONSTRAINT "MeetingRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
