# Phase 3-Fix Teacher Assignment Class Selector And People Flow QA Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Summary

This fix stabilizes the Teacher Assignment class selector without opening Phase 4 modules. The selector now uses real class rows from `/api/school-admin/classes?pageSize=100` and, when needed, real class relation rows embedded in section records. No fake Grade 1-12 options were added.

## Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-3-people-foundation-report.md`
- `docs/phase-2-school-admin-core-setup-report.md`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.core-setup.ts`
- `apps/api/src/modules/school-admin/school-admin.readiness.ts`
- `prisma/schema.prisma`

## Exact Root Cause

The backend class route and response envelope were correct:

- Frontend path: `/api/school-admin/classes?pageSize=100`
- Proxy target: `/v1/school-admin/classes?pageSize=100`
- Backend route: `GET /v1/school-admin/classes`
- Backend model: `ClassLevel`
- Response envelope: `{ success: true, data: ClassLevel[], pagination, meta }`

The UI issue was in the select binding. The teacher assignment form initializes `classId` to an empty string before async class options arrive. The class select did not have a stable empty placeholder option, so the browser could display a blank selected value even when real options later existed. Since the section dropdown already showed labels like `Grade 1 / B`, section records also proved real class data was present through `section.class`.

## Fix

- Added a stable `Select class` placeholder option for the required class select.
- Added stable placeholder options for required teacher and subject selects.
- Added `teacherAssignmentClassRows(classes, sections)`:
  - Primary source: class rows returned by `/api/school-admin/classes?pageSize=100`.
  - Fallback source: unique class rows extracted from section relation data.
  - Dedupe key: real `ClassLevel.id`.
  - Labels use real row fields only.
- Updated class option labels to support `name`, `title`, `className`, `gradeName`, `code`, and `status`.
- Kept `sectionId` optional with `All sections`.
- Updated backend relation includes to return status for section class, assignment class, assignment section, and assignment subject relations.

## Assignment Save Behavior

- Teacher assignment still saves to `POST /api/school-admin/teacher-assignments`.
- Edit still saves to `PATCH /api/school-admin/teacher-assignments/:id`.
- `teacherId`, `classId`, and `subjectId` remain required.
- Empty `sectionId` still means all sections.
- Browser required validation prevents saving while `Select class` is still selected.
- Backend school-scoped validation remains unchanged.
- After save, the assignment list and readiness refresh continue through the existing `onChanged()` and `refresh()` calls.

## Backend Route Changes

No new routes were added. Existing route behavior and prefixes are unchanged.

Changed relation payload shape only:

- `GET /v1/school-admin/sections` now includes `class.status`.
- `GET /v1/school-admin/teacher-assignments` now includes `class.status`, `section.status`, and `subject.status`.

## Schema And Migration

No schema changes. No migration added or applied.

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Browser QA Status

Not run. No dev server was started and no deployment was performed.

## Unverified Items

- Live browser confirmation that the deployed teacher assignment class dropdown shows Grade 1-12.
- Live browser save of a teacher assignment after selecting Grade 1.
- Teacher portal assigned class count after deployment.

## Safe To Commit

Safe to commit after review. Do not push, deploy, or apply migrations until approved.
