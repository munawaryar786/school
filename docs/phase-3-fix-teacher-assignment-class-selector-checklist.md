# Phase 3-Fix Teacher Assignment Class Selector And People Flow QA Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Fix the Teacher Assignment class selector so it shows real school-scoped class records and remains stable when classes exist directly or through section relations. Do not start Phase 4. Do not implement attendance, timetable, exams, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 2 and Phase 3 reports.
- Completed: Inspect School Admin portal teacher assignment form.
- Completed: Inspect School Admin backend route and response envelope for classes.
- Completed: Inspect core setup class/section behavior.
- Completed: Inspect readiness and schema for class/section/teacher assignment relations.
- Completed: Audit `/api/school-admin/classes?pageSize=100` to `/v1/school-admin/classes?pageSize=100` data path.
- Completed: Confirm frontend list normalization uses `data`.
- Completed: Confirm teacher assignment class field uses `classId`.
- Completed: Confirm select value uses class id.
- Completed: Confirm option label supports available class field names.
- Completed: Confirm form reset does not clear class after options load.
- Completed: Confirm no status filter hides classes by case.
- Completed: Use section relation as real-data fallback when class list is empty or malformed.
- Completed: Keep assignment save requiring teacher, class, and subject.
- Completed: Keep section optional with `All sections`.
- Completed: Add actionable no-data messaging.
- Completed: Run validation.
- Completed: Create implementation report.
- Completed: Create manual QA document.
- Completed: Stop before Phase 4.

## Findings

- Backend class list is `GET /v1/school-admin/classes`, mapped to `ClassLevel`, returned in the existing `{ success, data, pagination }` envelope.
- Frontend reads `payload.data` correctly.
- Teacher assignment uses `classId`, which matches `TeacherSubjectAssignment.classId`.
- The live blank select was caused by async selector options arriving after the form initialized with an empty `classId` and no explicit placeholder option. The browser could render a blank selected value even though options existed.
- Sections already include real `class` relation data, so the selector now uses section-linked class rows as a real-data fallback.
