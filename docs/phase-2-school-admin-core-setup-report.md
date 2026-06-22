# Phase 2 School Admin Core Setup Completion Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Phase 2 completed School Admin core setup improvements for Academic Years, Classes/Grades, Sections, Subjects/Courses, setup guidance, idempotent quick setup actions, readiness refresh, and teacher-assignment selector data flow.

This pass did not start Phase 3 and did not implement attendance, timetable, exams, fees, library, LMS, notices, reports, or settings.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-0-current-state-audit-report.md`
- `docs/phase-1-migration-deployment-readiness-report.md`
- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.readiness.ts`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `prisma/schema.prisma`

## Root Cause Of Empty Teacher Assignment Class Dropdown

Local route and field-shape audit found no class API route mismatch:

- Frontend calls `/api/school-admin/classes?pageSize=100`.
- Proxy maps to `/v1/school-admin/classes?pageSize=100`.
- Backend maps `classes` to `ClassLevel`.
- Class rows are returned as `id`, `name`, `code`, `status`.
- Teacher assignment class selector expects `row.id` and `row.name`.

The most likely cause is operational data/readiness: no class records existed in the target school, stale deployment/data refresh, or classes were not created before opening teacher assignment. The selector was made more robust by using class label fallbacks and status/code display, and a real idempotent class setup action now creates missing Grades 1-12.

## Backend Changes

Changed:

- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.core-setup.ts`

Added routes:

- `POST /v1/school-admin/classes/standard-1-12`
- `POST /v1/school-admin/subjects/common`

Preserved routes:

- `GET/POST/PATCH /v1/school-admin/academic-years`
- `GET/POST/PATCH /v1/school-admin/classes`
- `GET/POST/PATCH /v1/school-admin/sections`
- `GET/POST/PATCH /v1/school-admin/subjects`
- `GET /v1/school-admin/readiness`

Route rules:

- Backend prefix remains `/v1`.
- New routes are declared before generic `/:resource` catch-all routes.
- Routes use existing `authenticate` and `SCHOOL_OPERATIONS_MANAGE` middleware.
- Routes use `req.auth.schoolId`.
- Response envelope uses existing `ok`/`fail` style.
- No fake data or static demo rows were added.

## Class 1-12 Setup Behavior

`POST /v1/school-admin/classes/standard-1-12` creates missing standard classes only:

- Grade 1 / `G1`
- Grade 2 / `G2`
- Grade 3 / `G3`
- Grade 4 / `G4`
- Grade 5 / `G5`
- Grade 6 / `G6`
- Grade 7 / `G7`
- Grade 8 / `G8`
- Grade 9 / `G9`
- Grade 10 / `G10`
- Grade 11 / `G11`
- Grade 12 / `G12`

It is idempotent:

- Existing class names or codes are skipped.
- The response includes `created`, `existing`, `total`, and `rows`.
- It is school-scoped.
- It writes real database records only.

## Common Subject Setup Behavior

`POST /v1/school-admin/subjects/common` creates missing common subjects only:

- English
- Mathematics
- Science
- Social Studies
- Urdu
- Islamic Studies
- Computer Science
- General Knowledge

It is idempotent:

- Existing subject names or codes are skipped.
- The response includes `created`, `existing`, `total`, and `rows`.
- It is school-scoped.
- It writes real database records only.

## Frontend Changes

Changed:

- `apps/web/components/school-admin/school-admin-portal.tsx`

Implemented:

- Ordered setup wizard with real readiness counts.
- Wizard action buttons to open the relevant core setup workspaces.
- Classes workspace quick action: `Create missing 1-12`.
- Subjects workspace quick action: `Create common subjects`.
- Success/error messages for quick setup actions.
- Readiness refresh after quick setup actions.
- Class selector labels now show name, code, and status.
- Subject selector labels now show name, code, and status.
- Section selector labels now show class/section/status.
- Teacher assignment guidance when classes, subjects, or sections are missing.

## Academic Year Behavior

Existing backend behavior already supports active/current stabilization:

- Creating an `ACTIVE` academic year sets other school academic years to `INACTIVE`.
- Updating an academic year to `ACTIVE` sets other school academic years to `INACTIVE`.
- List/create/edit remain available through existing routes.
- Readiness refresh occurs after mutations.

## Section Behavior

Existing backend validation confirms selected class belongs to the same school before section create/update. Frontend class selectors now use robust class labels, and section list still displays class name from backend include.

## Subject Behavior

Subjects list/create/edit remain available. Common subject setup was added as an idempotent real-data helper. Subject selectors now use robust labels.

## Readiness Behavior

No schema changes were needed. Existing readiness flags remain:

- `hasAcademicYear`
- `hasActiveAcademicYear`
- `hasClass`
- `hasSection`
- `hasSubject`

Frontend calls refresh readiness after core setup mutations and quick setup actions.

## Schema And Migration Changes

None.

No migration was added or applied.

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npx.cmd prisma validate --schema=prisma/schema.prisma` | Passed | Prisma config deprecation warning only. |
| `npx.cmd prisma generate --schema=prisma/schema.prisma` | Passed | Prisma Client generated. |
| `node --max-old-space-size=640 --max-semi-space-size=64 ./node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --pretty false` | Failed | OOM under Project Owner's less-than-700 MB cap. |
| `node --max-old-space-size=688 --max-semi-space-size=64 ./node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --pretty false` | Failed | OOM under Project Owner's less-than-700 MB cap. |
| `node --max-old-space-size=640 --max-semi-space-size=64 ./node_modules/typescript/bin/tsc -p apps/web/tsconfig.json --noEmit --incremental false --pretty false` | Passed | Web typecheck passed under 700 MB. |
| `NODE_OPTIONS=--max-old-space-size=640 --max-semi-space-size=64 npm.cmd run test --workspace @school-erp/web` | Passed | Web role routes test passed. |
| `NODE_OPTIONS=--max-old-space-size=640 --max-semi-space-size=64 npm.cmd run build --workspace @school-erp/shared` | Passed | Shared build passed. |

## Migration Status

No migration was applied.

Phase 32D migration may still be required in the target DB before full Preview browser QA for parent links and teacher assignments.

## Browser QA Status

Not run. No dev server was started and no deployment was performed.

## Unverified Items

- API typecheck could not complete under the less-than-700 MB cap.
- Browser behavior is unverified until deployment/QA.
- Teacher assignment persistence still depends on the Phase 32D migration in the target DB.

## Files Changed

- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.core-setup.ts`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `docs/phase-2-school-admin-core-setup-checklist.md`
- `docs/phase-2-school-admin-core-setup-report.md`
- `docs/phase-2-school-admin-core-setup-manual-qa.md`

## Safe To Commit

Safe to commit after review with one caveat: API typecheck is blocked under the requested less-than-700 MB memory cap, so commit should be treated as code-reviewed plus partially validated until API typecheck can run on a machine/session with enough memory.

## Recommended Next Phase

Do not start Phase 3 yet. First resolve the API typecheck memory blocker or run API validation in an environment that can complete it safely.
