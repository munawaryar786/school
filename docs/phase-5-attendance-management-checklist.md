# Phase 5 Attendance Management And Parent Visibility Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Implement the real attendance foundation only: teacher attendance marking for assigned scope, school admin attendance monitoring, parent linked-child attendance visibility, and student own-attendance visibility if the existing student portal supports it. Do not start timetable, exams/results, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 4 admissions report.
- Completed: Read Phase 3 people foundation report.
- Completed: Inspect Prisma attendance, student, teacher assignment, class, and section models.
- Completed: Determine whether schema changes are required.
- Completed: Inspect School Admin routes and portal.
- Completed: Inspect Teacher routes and portal.
- Completed: Inspect Parent routes and portal.
- Completed: Inspect Student routes and portal if present.
- Completed: Implement/stabilize teacher attendance context route.
- Completed: Implement/stabilize teacher attendance students route.
- Completed: Implement/stabilize teacher attendance mark route.
- Completed: Implement/stabilize School Admin attendance list route.
- Completed: Implement/stabilize School Admin attendance summary route.
- Completed: Implement/stabilize Parent attendance visibility route.
- Completed: Implement Student attendance visibility if supported.
- Completed: Update frontend teacher attendance UI.
- Completed: Update frontend school admin attendance monitoring UI.
- Completed: Update frontend parent attendance UI.
- Completed: Update frontend student attendance UI if supported.
- Completed: Update readiness for attendance count/flag/next action.
- Completed: Preserve `/v1` backend prefix and `/api` frontend prefix.
- Completed: Avoid fake data/static rows.
- Completed: Run required validation.
- Completed: Create Phase 5 implementation report.
- Completed: Create Phase 5 manual QA document.
- Completed: Stop before Phase 6.

## Notes

- Existing `TeacherAttendance` was used because teacher, parent, and student portals already reference it.
- No migration was added.
- Current attendance records are scoped by `schoolId`, `teacherId`, `studentName`, `className`, and `attendanceDate`; there is no `studentId` or `sectionId` field in the existing model.
- API typecheck initially OOMed at 768MB until Phase 5 attendance Zod-heavy schemas were replaced with lightweight manual validation.
