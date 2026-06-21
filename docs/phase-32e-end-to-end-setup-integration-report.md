# Phase 32E End-to-End Setup Integration Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Summary

Phase 32E adds a real School Admin readiness engine and connects the dashboard/module cards to school-scoped setup counts. The core flow is now represented end-to-end:

Academic Year -> Class -> Section -> Subject -> Teacher -> Teacher Assignment -> Student -> Parent/Guardian Link -> Parent Portal Child Visibility -> Parent Leave Request -> School Admin Leave Review.

This pass did not open full Attendance, Timetable, Exams, Fees, Library, Reading, LMS, Notices, Reports, or Settings workflows.

## Current Bugs Found

| Issue | Root cause |
| --- | --- |
| Parent management API can appear unavailable | Preview may not have latest route deployment and/or pending Phase 32D guardian-link table. |
| Teacher assignment records can show selected resource unavailable | Teacher assignment table depends on pending Phase 32D migration in environments where it is not applied. |
| Parent-child linking can fail even when student exists | Link route requires `GuardianStudentLink`; if migration is pending, link cannot persist. |
| Dashboard cards show Setup Required after records exist | Dashboard was using static module config instead of real dependency readiness. |
| Locked modules had static dependency messaging | Missing dependency list was not calculated from school data. |

## Bugs Fixed

- Added `GET /v1/school-admin/readiness`.
- Added `/api/school-admin/readiness` frontend consumption through existing proxy.
- Dashboard setup coach and action queue now use readiness flags/actions.
- Module cards now show readiness-driven status, real count, missing dependencies, and next action.
- Opened module cards now have `Open workspace` actions.
- Mutations refresh readiness after create/edit/link/teacher assignment changes.
- Parent portal falls back to `guardianName` if `GuardianStudentLink` table is missing, preserving backward compatibility.
- Parent management list falls back to parent memberships if guardian-link table is missing.
- Teacher assignment list returns an empty list instead of crashing if the pending table is unavailable.
- Link/create assignment mutations return actionable migration-required messages if pending tables are unavailable.
- Global API error handler now respects explicit route `statusCode` errors for safe 404/403/400 responses.

## Readiness Route

Added:

- `GET /v1/school-admin/readiness`

Frontend:

- `GET /api/school-admin/readiness`

Response includes:

- `counts`
- `flags`
- `modules`
- `nextActions`

Readiness is school-scoped by `req.auth.schoolId` and protected by `SCHOOL_OPERATIONS_MANAGE`.

## Backend Routes Changed

Changed:

- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/parent/parent.routes.ts`
- `apps/api/src/middleware/error-handler.ts`

Existing `/v1` backend prefix was preserved.

## Frontend Changes

Changed:

- `apps/web/components/school-admin/school-admin-portal.tsx`

Existing `/api` proxy prefix was preserved. No `/api/v1` was added.

## Schema And Migration

No schema or migration changes were made in Phase 32E.

Existing pending migration remains required for full Preview verification:

- `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`

It was not applied.

## Parent-Child Link Result

The backend still validates parent membership and student ownership by school before linking. Parent portal now safely prefers `GuardianStudentLink` and falls back to `guardianName` if the guardian-link table is unavailable.

## Teacher Assignment Result

Teacher assignments remain school-scoped and validate teacher/class/section/subject ownership. The UI now refreshes readiness after assignment create/edit. If the assignment table is not migrated in Preview, list falls back to empty and mutations return a migration-required message.

## Dashboard Readiness Behavior

- Setup coach uses real readiness flags.
- Action queue uses backend next actions and missing dependencies.
- Module cards use backend module status:
  - `READY`
  - `SETUP_REQUIRED`
  - `DEPENDENCY_REQUIRED`
  - `COMING_LATER`
- Counts are real database counts only.
- No fake rows or static counts were added.

## Modules Still Locked

- Attendance: requires active academic year, class, section, student, teacher assignment.
- Timetable: requires active academic year, class, section, subject, teacher assignment.
- Exams/Results: requires active academic year, class, section, subject, student.
- Fees/Finance: requires student and later fee setup.
- Library: requires student and later catalog setup.
- Reading Program: coming later after library catalog.
- LMS: requires class, subject, teacher assignment.
- Notices, Reports, Settings: coming later.

## Validation Results

- `npx.cmd prisma validate --schema=prisma/schema.prisma`: Passed.
- `npx.cmd prisma generate --schema=prisma/schema.prisma`: Passed.
- `cmd /c "set NODE_OPTIONS=--max-old-space-size=1536&& npm.cmd run typecheck --workspace @school-erp/web"`: Passed.
- `npm.cmd run test --workspace @school-erp/web`: Passed.
- `npm.cmd run build --workspace @school-erp/shared`: Passed.
- `npm.cmd run typecheck --workspace @school-erp/api`: Blocked by local out-of-memory after repeated retries with 1536 MB and 1024 MB heap.
- `npx.cmd prisma migrate status --schema=prisma/schema.prisma`: Blocked by Neon permission: `permission denied for table _prisma_migrations`.

## Unverified Items

- Browser QA was not run because dev server was not run.
- Preview deployment was not verified.
- Full parent-child link and teacher assignment persistence in Preview require the pending Phase 32D migration to be applied by an authorized DB user.
