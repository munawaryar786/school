# Phase 9 - LMS / Homework And Assignments Foundation Checklist

Status: Completed

## Required Reading
- [x] docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md
- [x] docs/phase-8-fees-finance-report.md
- [x] docs/phase-7-exams-results-report.md

## Audit
- [x] Inspect Prisma homework/LMS/submission models.
- [x] Inspect School Admin route patterns.
- [x] Inspect Teacher route assignment scoping.
- [x] Inspect Parent linked-child homework/LMS visibility patterns.
- [x] Inspect Student own-class homework/LMS visibility patterns.
- [x] Inspect School Admin, Parent, Student, and Teacher UI surfaces.

## Implementation
- [x] Add/stabilize Teacher homework routes.
- [x] Add/stabilize Teacher LMS material routes.
- [x] Add/stabilize School Admin homework monitoring routes.
- [x] Add/stabilize School Admin LMS monitoring and summary routes.
- [x] Add/stabilize Parent homework and LMS visibility routes.
- [x] Add/stabilize Student homework and LMS visibility routes.
- [x] Add Teacher homework/LMS creation UI scoped to assignments.
- [x] Add School Admin homework/LMS monitoring UI.
- [x] Add Parent linked-child homework/LMS UI.
- [x] Add Student own homework/LMS UI.
- [x] Update readiness with homework/LMS counts and flags.
- [x] Avoid schema changes unless required.

## Validation
- [x] npx.cmd prisma validate --schema=prisma/schema.prisma
- [x] npx.cmd prisma generate --schema=prisma/schema.prisma
- [x] API typecheck with 768MB heap.
- [x] Web typecheck with 1024MB heap.
- [x] Web tests.
- [x] Shared build.

## Documents
- [x] Create docs/phase-9-lms-homework-assignments-report.md
- [x] Create docs/phase-9-lms-homework-assignments-manual-qa.md