# Phase 32D Core School Setup And People Implementation Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Summary

Phase 32D opens the core setup and people-management foundation for the existing premium single-school shell. It does not implement attendance marking, timetable building, exams/results, fees, library circulation, reading program, or LMS workflows.

## Modules Opened

- Academic Setup
- Classes
- Sections
- Subjects/Courses
- Students
- Teachers
- Parents/Guardians
- Parent-child linking
- Teacher class/section/subject assignment foundation

## Modules Still Locked Or Deferred

- Attendance
- Timetable
- Exams/Results
- Fees/Finance
- Library
- Reading Program
- LMS
- Notification provider
- Reports export
- AI/risk scoring

Locked modules now show dependency-aware messaging instead of the old Phase 32B placeholder wording.

## Backend Routes Added Or Changed

Existing school-admin generic CRUD remains available under `/v1/school-admin`:

- `GET/POST/PATCH /v1/school-admin/academic-years`
- `GET/POST/PATCH /v1/school-admin/classes`
- `GET/POST/PATCH /v1/school-admin/sections`
- `GET/POST/PATCH /v1/school-admin/subjects`
- `GET/POST/PATCH /v1/school-admin/students`
- `GET/POST/PATCH /v1/school-admin/teachers`

Added/changed explicit routes:

- `GET /v1/school-admin/parents`
- `POST /v1/school-admin/parents`
- `POST /v1/school-admin/parents/:parentId/link-child`
- `PATCH /v1/school-admin/parents/:parentId/login-status`
- `GET /v1/school-admin/teacher-assignments`
- `POST /v1/school-admin/teacher-assignments`
- `PATCH /v1/school-admin/teacher-assignments/:id`

The backend `/v1` prefix and frontend `/api` proxy routing were not changed.

## Frontend Changes

Changed `apps/web/components/school-admin/school-admin-portal.tsx`.

The school-admin portal now includes real management workspaces for the opened modules, including:

- loading states
- error states
- empty states
- retry buttons
- create/edit forms
- real table data
- parent-child linking controls
- parent login enable/disable controls
- teacher assignment controls

No fake rows or static demo records were added.

## Prisma And Migration Changes

Changed `prisma/schema.prisma`.

Added:

- `GuardianRelationType`
- `GuardianStudentLink`
- `TeacherSubjectAssignment`

Added migration:

- `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`

Migration was not applied in this pass.

## Parent Portal Compatibility

Changed `apps/api/src/modules/parent/parent.routes.ts`.

Parent scope now reads verified `GuardianStudentLink` records first. If no verified links exist, it falls back to the existing `guardianName` matching behavior to preserve Phase 32C compatibility.

## Permission And Tenant Protections

- School-admin routes still require `SCHOOL_OPERATIONS_MANAGE`.
- All school-admin queries use `req.auth.schoolId`.
- Parent-child linking validates both parent membership and student belong to the same school.
- Teacher assignments validate teacher, class, section, and subject ownership before saving.
- Section creation/update validates class ownership before saving.
- Invalid cross-school IDs return safe 404/403 style responses.

## Validation Results

- `npx.cmd prisma validate --schema=prisma/schema.prisma`: Passed.
- `npx.cmd prisma generate --schema=prisma/schema.prisma`: Passed.
- `npm.cmd run typecheck --workspace @school-erp/api`: Passed.
- `cmd /c "set NODE_OPTIONS=--max-old-space-size=1536&& npm.cmd run typecheck --workspace @school-erp/web"`: Passed.
- `npm.cmd run test --workspace @school-erp/web`: Passed.
- `npm.cmd run build --workspace @school-erp/shared`: Passed.
- `npx.cmd prisma migrate status --schema=prisma/schema.prisma`: Blocked by database permission. The configured Neon user connected but does not have permission for `_prisma_migrations`.

## Migration Status

Pending and not applied.

The migration status command could not confirm DB state because the database account lacks permission on `_prisma_migrations`.
