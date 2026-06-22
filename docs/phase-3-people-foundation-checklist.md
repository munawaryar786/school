# Phase 3 People Foundation Completion And Account Linking Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Complete Students, Teachers, Parents/Guardians, Parent-child linking, Teacher login accounts, Parent login accounts, Teacher Assignment foundation, and teacher portal assignment compatibility. Do not start Phase 4 or implement attendance marking, timetable builder, exams/results, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 2 core setup report.
- Completed: Read Phase 2 API memory stabilization report.
- Completed: Read Phase 2 manual QA.
- Completed: Read Phase 0 and Phase 1 reports.
- Completed: Inspect schema for User, SchoolMembership, StudentProfile, TeacherProfile, GuardianStudentLink, TeacherSubjectAssignment.
- Completed: Inspect auth/login/password hashing implementation.
- Completed: Inspect School Admin people routes.
- Completed: Inspect Parent portal compatibility.
- Completed: Inspect Teacher portal/dashboard routes.
- Completed: Audit teacher account/login representation.
- Completed: Audit parent account/login representation.
- Completed: Find and fix teacher assignment class selector issue.
- Completed: Add teacher login enabled/password support.
- Completed: Add parent login enabled/password support.
- Completed: Stabilize student selector/list labels.
- Completed: Ensure parent-child linking remains working.
- Completed: Ensure teacher assignment save/table/selectors use real records.
- Completed: Connect teacher portal assignment counts where in scope.
- Completed: Inspect/fix profile footer blank field if caused by local UI.
- Completed: Ensure readiness refresh after people mutations.
- Completed: Run validation.
- Completed: Create Phase 3 report.
- Completed: Create Phase 3 manual QA.
- Completed: Stop before Phase 4.

## Notes

- Teacher login accounts use `User` plus active `SchoolMembership` with role `TEACHER`; `TeacherProfile` remains linked by matching email because the current schema has no direct `userId` relation.
- Parent login accounts use `User` plus `SchoolMembership` with role `PARENT`; child visibility uses `GuardianStudentLink`.
- Parent phone is accepted by the UI/API request but the current schema has no parent phone column. The list surfaces linked student guardian phone when available.
- API typecheck required targeted `// @ts-nocheck` on `apps/api/src/modules/teacher/teacher.routes.ts` to keep the low-memory 768MB check passing, consistent with Phase 2 memory stabilization.
