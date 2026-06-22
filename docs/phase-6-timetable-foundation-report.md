# Phase 6 Timetable Foundation And Role Visibility Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Phase 6 opened the timetable foundation only. Exams/results, fees, library, LMS, notices, reports, and settings were not started. No push, merge, deployment, dev server, npm install, `db push`, or migrate reset was run.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-5-attendance-management-report.md`
- `docs/phase-4-admissions-academic-setup-report.md`
- `prisma/schema.prisma`
- School Admin, Teacher, Parent, and Student API routes
- School Admin, Teacher, Parent, and Student/role portal frontend components

## Timetable Model Behavior

The existing `TimetableSlot` model was used. No schema change was required.

Supported fields in the current schema:

- `schoolId`
- `className`
- `subject`
- `teacher`
- `dayOfWeek`
- `startsAt`
- `endsAt`
- `status`
- timestamps

Known limitations from the current schema: section-specific slots, room, and notes are not stored yet. The UI states this limitation instead of pretending those fields exist.

## School Admin Timetable Behavior

School Admin can now:

- list timetable slots
- create timetable slots
- edit timetable slots
- delete timetable slots
- choose real classes, real subjects, and real teachers from school-scoped resources
- validate required class, subject, teacher, day, start time, and end time
- reject invalid time ranges where end time is not after start time
- see conflict warnings when a teacher or class has an overlapping active slot

Routes added/stabilized:

- `GET /v1/school-admin/timetable`
- `POST /v1/school-admin/timetable`
- `PATCH /v1/school-admin/timetable/:id`
- `DELETE /v1/school-admin/timetable/:id`

All School Admin timetable writes validate school-scoped class, subject, and teacher records before saving. Browser calls use `/api/school-admin/timetable`.

## Teacher Timetable Visibility

Added `GET /v1/teacher/timetable`.

Teacher dashboard now shows `My Timetable` using real timetable slots assigned to the logged-in teacher profile name. Teachers only receive slots from their own school and own teacher profile match.

## Parent Timetable Visibility

Parent portal now loads timetable records through `/api/parent/timetable` and filters the selected linked child by class name. Parent route scoping remains based on linked children and school context, so parents cannot load unrelated class timetable outside their linked children.

## Student Timetable Visibility

Added explicit `GET /v1/student/timetable` before the generic student resource route. Student dashboard now shows `My Timetable` for the student's scoped class only.

## Readiness Updates

Readiness now includes:

- `counts.timetableSlots`
- `flags.hasTimetable`
- timetable module requires active academic year, class, section, subject, teacher assignment, and at least one timetable slot
- setup coach includes `Create timetable slots`

## Backend Files Changed

- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.readiness.ts`
- `apps/api/src/modules/teacher/teacher.routes.ts`
- `apps/api/src/modules/parent/parent.routes.ts`
- `apps/api/src/modules/student/student.routes.ts`

## Frontend Files Changed

- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/web/components/dashboard/role-dashboard-foundation.tsx`
- `apps/web/components/parent/parent-portal.tsx`

## Schema And Migration Changes

No schema changes were made. No migration was created or applied.

## Permissions And Security Notes

- School Admin timetable routes use existing School Admin auth and `SCHOOL_OPERATIONS_MANAGE` permission.
- Teacher timetable route uses existing Teacher portal auth and teacher profile scope.
- Parent timetable route uses linked-child school scope.
- Student timetable route uses existing student scope.
- No raw Prisma errors are intentionally exposed.
- No fake timetable rows or counts were added.

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed after importing `CalendarDays`: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Browser QA Status

Not run because dev server and deployment were explicitly disallowed. Manual QA is documented separately.

## Unverified Items

- Browser creation/edit/delete flow must be verified after redeploy.
- Teacher matching uses teacher profile name because the current `TimetableSlot` schema stores teacher text, not `teacherId`.
- Student and parent timetable matching uses class name because the current schema stores `className`, not `classId` or `sectionId`.
- Section-specific timetable, room, and notes require a future schema expansion if needed.

## Safe To Commit

Yes, after Project Owner review. Do not push or deploy without approval.