# Phase 3-Fix-2 Definitive Teacher Assignment Class Dropdown Fix Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Summary

This pass removes Teacher Assignment from the generic form path and gives it a dedicated form with explicit state. The class dropdown now uses real normalized class options from both direct class records and section relation records, and it can infer class from a selected section when safe.

No Phase 4 modules were opened. No fake data was added.

## Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-3-fix-teacher-assignment-class-selector-report.md`
- `docs/phase-3-people-foundation-report.md`
- `docs/phase-2-school-admin-core-setup-report.md`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `prisma/schema.prisma`

## Exact Root Cause

The previous fix still left Teacher Assignment inside the generic `ResourceForm`/config system. Even with placeholder options, the form still depended on a config-driven abstraction and could not explicitly manage class/section coupling. The live state showed section data had class context, but the class select remained blank, so the durable fix was to stop relying on generic form assumptions for this workflow.

## Dedicated Form

Added a dedicated `TeacherAssignmentForm` inside `apps/web/components/school-admin/school-admin-portal.tsx`.

It owns explicit local state:

- `teacherId`
- `classId`
- `sectionId`
- `subjectId`
- `status`

This prevents `classId` from being hidden or reset by rebuilt generic config objects.

## Class Option Normalization

Class options are normalized by `teacherAssignmentClassRows(classes, sections)`.

Primary source:

- direct rows from `/api/school-admin/classes?pageSize=100`

Fallback source:

- real class context embedded in `/api/school-admin/sections?pageSize=100`

Supported standalone class fields:

- `id`
- `name`
- `title`
- `className`
- `gradeName`
- `code`
- `status`

Supported section relation shapes:

- `section.class`
- `section.classLevel`
- `section.classInfo`
- `section.classRecord`

Supported section fallback fields:

- `section.classId`
- `section.className`
- `section.classCode`
- `section.classStatus`

Rules:

- Options are deduped by real class id only.
- No hardcoded Grade 1-12 options.
- Last-resort display label `Class ${index + 1}` is used only when a real class id exists but label fields are blank.

## Section Fallback Behavior

- If no direct class rows are available but section rows include class relation or `classId`, those section-derived real class ids appear in the Class dropdown.
- Selecting a section while `classId` is empty auto-sets `classId` when the selected section's class id exists in normalized class options.
- When a class is selected, section options are filtered to `All sections` plus sections for that class.
- With no class selected, all real sections remain visible.

## Save Behavior

Before submit:

- `teacherId` is required.
- `classId` is required.
- `subjectId` is required.
- `sectionId` is optional.

If `classId` is empty but a selected section has a valid class id, the form infers `classId` before submit.

Save routes are unchanged:

- `POST /api/school-admin/teacher-assignments`
- `PATCH /api/school-admin/teacher-assignments/:id`

After save:

- Assignment table updates.
- Readiness refresh is triggered through the existing parent callback.
- Class options remain independent of generic form config resets.

## Backend Changes

No backend code was changed in this Fix-2 pass. Existing backend route behavior remains:

- `GET /v1/school-admin/classes`
- `GET /v1/school-admin/sections`
- `GET /v1/school-admin/teacher-assignments`
- `POST /v1/school-admin/teacher-assignments`
- `PATCH /v1/school-admin/teacher-assignments/:id`

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

- Live browser confirmation that the class dropdown now shows real classes.
- Live save of a teacher assignment in Preview.
- Teacher portal assigned class count after deployment.

## Safe To Commit

Safe to commit after review. Do not push, deploy, or apply migrations until approved.
