-- Phase 16: Communication
CREATE TABLE "CommunicationSms" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationSms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationEmail" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationEmail_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationPushNotification" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationPushNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationMessage" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationAnnouncement" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "audience" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "publishOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunicationSms_schoolId_status_idx" ON "CommunicationSms"("schoolId", "status");
CREATE INDEX "CommunicationSms_schoolId_recipientName_idx" ON "CommunicationSms"("schoolId", "recipientName");
CREATE INDEX "CommunicationSms_schoolId_createdAt_idx" ON "CommunicationSms"("schoolId", "createdAt");
CREATE INDEX "CommunicationEmail_schoolId_status_idx" ON "CommunicationEmail"("schoolId", "status");
CREATE INDEX "CommunicationEmail_schoolId_recipientName_idx" ON "CommunicationEmail"("schoolId", "recipientName");
CREATE INDEX "CommunicationEmail_schoolId_createdAt_idx" ON "CommunicationEmail"("schoolId", "createdAt");
CREATE INDEX "CommunicationPushNotification_schoolId_status_idx" ON "CommunicationPushNotification"("schoolId", "status");
CREATE INDEX "CommunicationPushNotification_schoolId_recipientName_idx" ON "CommunicationPushNotification"("schoolId", "recipientName");
CREATE INDEX "CommunicationPushNotification_schoolId_createdAt_idx" ON "CommunicationPushNotification"("schoolId", "createdAt");
CREATE INDEX "CommunicationMessage_schoolId_status_idx" ON "CommunicationMessage"("schoolId", "status");
CREATE INDEX "CommunicationMessage_schoolId_senderName_idx" ON "CommunicationMessage"("schoolId", "senderName");
CREATE INDEX "CommunicationMessage_schoolId_recipientName_idx" ON "CommunicationMessage"("schoolId", "recipientName");
CREATE INDEX "CommunicationAnnouncement_schoolId_status_idx" ON "CommunicationAnnouncement"("schoolId", "status");
CREATE INDEX "CommunicationAnnouncement_schoolId_audience_idx" ON "CommunicationAnnouncement"("schoolId", "audience");
CREATE INDEX "CommunicationAnnouncement_schoolId_publishOn_idx" ON "CommunicationAnnouncement"("schoolId", "publishOn");

ALTER TABLE "CommunicationSms" ADD CONSTRAINT "CommunicationSms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationEmail" ADD CONSTRAINT "CommunicationEmail_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationPushNotification" ADD CONSTRAINT "CommunicationPushNotification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationAnnouncement" ADD CONSTRAINT "CommunicationAnnouncement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
