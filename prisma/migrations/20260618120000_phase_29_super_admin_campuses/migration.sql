-- Phase 29 Slice 2: Super Admin campus foundation.
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Campus_schoolId_code_key" ON "Campus"("schoolId", "code");
CREATE INDEX "Campus_schoolId_status_idx" ON "Campus"("schoolId", "status");
CREATE INDEX "Campus_status_idx" ON "Campus"("status");

ALTER TABLE "Campus" ADD CONSTRAINT "Campus_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
