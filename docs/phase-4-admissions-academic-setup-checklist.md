# Phase 4 Admissions And Academic Setup Completion Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Complete admissions and academic setup foundation: academic years, admissions/applicants, class/section/subject stability, admission-to-student conversion, and readiness/dashboard guidance. Do not start attendance, timetable, exams/results, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 3 People Foundation report.
- Completed: Read Phase 3-Fix-2 report.
- Completed: Read Phase 2 Core Setup report.
- Completed: Inspect Prisma schema for academic and admission models.
- Completed: Inspect School Admin routes and readiness code.
- Completed: Inspect School Admin portal UI.
- Completed: Determine whether admissions already exist in schema.
- Completed: Determine whether migration is required.
- Completed: Stabilize academic year active behavior and optional activate route.
- Completed: Confirm classes/sections/subjects behavior and selectors.
- Completed: Implement admissions list/create/edit/status where schema supports.
- Completed: Implement admission-to-student conversion.
- Completed: Stabilize student academic assignment within current schema.
- Completed: Update readiness for admissions where possible.
- Completed: Update School Admin portal admissions UI.
- Completed: Preserve `/v1` backend prefix and `/api` frontend prefix.
- Completed: Avoid fake data/static rows.
- Completed: Run required validation.
- Completed: Create Phase 4 implementation report.
- Completed: Create Phase 4 manual QA document.
- Completed: Stop before Phase 5.

## Notes

- Admissions models already exist: `AdmissionApplication` and `AdmissionEnrollment`.
- No schema or migration change was required.
- Current `StudentProfile` stores `className` as text and does not have academic year, class, or section foreign keys; Phase 4 conversion uses the supported schema fields and documents this limitation.
