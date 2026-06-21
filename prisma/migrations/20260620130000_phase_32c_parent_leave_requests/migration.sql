-- Phase 32C parent leave request foundation.

CREATE TYPE "LeaveRequestType" AS ENUM (
  'FULL_DAY',
  'MULTI_DAY',
  'HALF_DAY',
  'LATE_ARRIVAL',
  'EARLY_PICKUP',
  'MEDICAL_APPOINTMENT',
  'EMERGENCY',
  'FAMILY',
  'OTHER'
);

CREATE TYPE "LeaveRequestStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'CLARIFICATION_REQUESTED',
  'CANCELLED'
);

CREATE TABLE "LeaveRequest" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "type" "LeaveRequestType" NOT NULL,
  "status" "LeaveRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT,
  "endTime" TEXT,
  "reason" TEXT NOT NULL,
  "parentNote" TEXT,
  "reviewerId" TEXT,
  "reviewerComment" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveRequestTimeline" (
  "id" TEXT NOT NULL,
  "leaveRequestId" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeaveRequestTimeline_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeaveRequest_schoolId_status_idx" ON "LeaveRequest"("schoolId", "status");
CREATE INDEX "LeaveRequest_schoolId_studentId_idx" ON "LeaveRequest"("schoolId", "studentId");
CREATE INDEX "LeaveRequest_schoolId_requestedById_idx" ON "LeaveRequest"("schoolId", "requestedById");
CREATE INDEX "LeaveRequest_schoolId_startDate_idx" ON "LeaveRequest"("schoolId", "startDate");
CREATE INDEX "LeaveRequestTimeline_leaveRequestId_createdAt_idx" ON "LeaveRequestTimeline"("leaveRequestId", "createdAt");
CREATE INDEX "LeaveRequestTimeline_actorId_idx" ON "LeaveRequestTimeline"("actorId");

ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeaveRequestTimeline" ADD CONSTRAINT "LeaveRequestTimeline_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequestTimeline" ADD CONSTRAINT "LeaveRequestTimeline_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
