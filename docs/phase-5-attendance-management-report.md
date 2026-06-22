# Phase 5 Attendance Management And Parent Visibility Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Phase 5 opened the attendance foundation only. Timetable, exams/results, fees, library, LMS, notices, reports, and settings were not started.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-4-admissions-academic-setup-report.md`
- `docs/phase-3-people-foundation-report.md`
- `prisma/schema.prisma`
- School Admin, Teacher, Parent, and Student API routes
- School Admin, Teacher, Parent, and Student frontend portals

## Attendance Model Behavior

The existing `TeacherAttendance` model was used. No schema change was required.

Supported fields:

- `schoolId`
- `teacherId`
- `studentName`
- `className`
- `attendanceDate`
- `status`
- `remarks`
- timestamps

Known limitation: the existing model does not store `studentId`, `classId`, or `sectionId`. Phase 5 therefore validates teacher assignment by class/section before writing, then stores the existing supported `className` and `studentName` fields.

## Teacher Attendance Behavior

Added teacher routes:

- `GET /v1/teacher/attendance/context`
- `GET /v1/teacher/attendance/students`
- `POST /v1/teacher/attendance/mark`

Teacher portal now includes an Attendance Marking panel. Teachers can load assigned class context, select class/section/date, load real students for the class, mark statuses, and save attendance. Existing same-day records are updated instead of duplicated.

Teachers cannot mark unassigned class scope.

## School Admin Attendance Behavior

Added School Admin routes:

- `GET /v1/school-admin/attendance`
- `GET /v1/school-admin/attendance/summary`

School Admin portal now opens Attendance Monitoring. It shows date/status filters, real status counts, and real attendance rows.

School Admin dashboard/readiness attendance counts now use `TeacherAttendance` so teacher-marked attendance is visible in the same operating flow.

## Parent Attendance Visibility

Parent portal now shows Recent Attendance for the selected linked child using `/api/parent/attendance`.

Parent backend scoping remains based on linked children. Parent cannot see unrelated child attendance because the existing parent attendance list is filtered by linked child names.

## Student Attendance Visibility

Student dashboard now includes a My Attendance panel using `/api/student/attendance`. It shows own recent attendance rows and a local attendance rate summary.

Student scoping remains based on the existing student portal scope.

## Readiness Updates

Readiness now includes `hasAttendance` and uses teacher-marked attendance records for attendance counts.

The setup coach now includes a Mark Attendance step after teacher assignment.

## Low-Memory Typecheck Note

API typecheck initially OOMed at 768MB after adding Phase 5 attendance validation. The new attendance-specific heavy Zod schemas were replaced with lightweight manual validators. After that, API typecheck passed at 768MB.

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed after low-memory refactor: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Migration Status

No schema changes were made. No migration was created or applied.

## Browser QA Status

Not run because `npm run dev` and deployment were explicitly disallowed. Manual QA is documented separately.

## Unverified Items

- Browser marking flow should be verified after redeploy.
- Section-specific persistence is limited by the existing `TeacherAttendance` schema.
- Approved leave is suggested as `EXCUSED` in teacher roster loading, but attendance records still store only the supported status/remarks fields.

## Safe To Commit

Yes, after Project Owner review. Do not push or deploy without approval.
