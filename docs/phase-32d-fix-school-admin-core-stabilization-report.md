# Phase 32D-Fix School Admin Core Stabilization Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Summary

This pass stabilized the opened Phase 32D school-admin workflows. It did not open attendance, timetable, exams, fees, library, reading, LMS, notices, reports, or settings.

## Bugs Found And Fixed

| Bug | Fix |
| --- | --- |
| Parents module could show `School Admin resource not found.` | Kept parent routes explicit before catch-all and added frontend error mapping. |
| Parent-child linking could show `Route not found.` | Confirmed explicit link route and added actionable frontend link failure message. |
| Missing `PATCH /v1/school-admin/parents/:parentId` | Added scoped parent edit route. |
| Teacher assignment edit button did nothing | Added edit state and PATCH save behavior. |
| Opened CRUD workflows relied only on generic catch-all routes | Added explicit route registration for opened core resources before generic fallback. |
| Raw backend route/resource errors leaked to UI | Added friendly School Admin API error mapper. |

## Route Matrix Summary

| Workflow | Frontend route | Backend route | Method | Permission | Scope |
| --- | --- | --- | --- | --- | --- |
| Academic years | `/api/school-admin/academic-years` | `/v1/school-admin/academic-years` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId` |
| Classes | `/api/school-admin/classes` | `/v1/school-admin/classes` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId` |
| Sections | `/api/school-admin/sections` | `/v1/school-admin/sections` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId`, class ownership |
| Subjects | `/api/school-admin/subjects` | `/v1/school-admin/subjects` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId` |
| Students | `/api/school-admin/students` | `/v1/school-admin/students` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId` |
| Teachers | `/api/school-admin/teachers` | `/v1/school-admin/teachers` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | `req.auth.schoolId` |
| Parents | `/api/school-admin/parents` | `/v1/school-admin/parents` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | school parent membership |
| Parent-child link | `/api/school-admin/parents/:parentId/link-child` | `/v1/school-admin/parents/:parentId/link-child` | POST | `SCHOOL_OPERATIONS_MANAGE` | parent and student school ownership |
| Parent login status | `/api/school-admin/parents/:parentId/login-status` | `/v1/school-admin/parents/:parentId/login-status` | PATCH | `SCHOOL_OPERATIONS_MANAGE` | school parent membership |
| Teacher assignments | `/api/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | GET/POST/PATCH | `SCHOOL_OPERATIONS_MANAGE` | teacher/class/section/subject ownership |

## Backend Changes

Changed `apps/api/src/modules/school-admin/school-admin.routes.ts`.

- Added explicit opened-resource routes before catch-all.
- Added shared list/create/update handlers.
- Added `PATCH /v1/school-admin/parents/:parentId`.
- Preserved `/v1` routing.

## Frontend Changes

Changed `apps/web/components/school-admin/school-admin-portal.tsx`.

- Teacher assignments can now be edited.
- Parent linking shows no-student setup guidance.
- Raw route/resource errors are converted to actionable messages.
- Preserved `/api/school-admin/*` proxy calls.

## Schema And Migration

No schema or migration changes were made in this fix pass.

Existing pending migration remains not applied:

- `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`

## Results

- Parent management: list/create/edit/login-status/link-child stabilized.
- Teacher assignment: list/create/edit stabilized.
- Opened modules usable: Academic Setup, Classes, Sections, Subjects/Courses, Students, Teachers, Parents/Guardians.
- Locked modules remain locked: Attendance, Timetable, Exams/Results, Fees/Finance, Library, Reading Program, LMS, Notices, Reports, Settings.

## Validation

- `npx.cmd prisma validate --schema=prisma/schema.prisma`: Passed.
- `npx.cmd prisma generate --schema=prisma/schema.prisma`: Passed.
- `npm.cmd run typecheck --workspace @school-erp/api`: Passed.
- `cmd /c "set NODE_OPTIONS=--max-old-space-size=1536&& npm.cmd run typecheck --workspace @school-erp/web"`: Passed.
- `npm.cmd run test --workspace @school-erp/web`: Passed.
- `npm.cmd run build --workspace @school-erp/shared`: Passed.
- `npx.cmd prisma migrate status --schema=prisma/schema.prisma`: Blocked by DB permission, `permission denied for table _prisma_migrations`.

## Unverified

- Browser QA was not executed because no dev server was run.
- Preview deployment was not verified.
- Migration status cannot be confirmed with the current Neon user.
