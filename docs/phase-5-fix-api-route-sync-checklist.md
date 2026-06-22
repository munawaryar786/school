# Phase 5-Fix API Route Deployment Sync And Attendance/Admissions Route Audit Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Audit and fix route/proxy/deployment mismatch for Admissions, Teacher Attendance, and School Admin Attendance only. Do not start Phase 6 or implement timetable, exams, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Inspect API app route mounts.
- Completed: Inspect School Admin admissions and attendance routes.
- Completed: Inspect Teacher attendance routes.
- Completed: Inspect School Admin frontend proxy route.
- Completed: Inspect Teacher frontend proxy route.
- Completed: Inspect shared API proxy and backend routing helpers.
- Completed: Inspect School Admin portal admissions/attendance calls.
- Completed: Inspect Teacher attendance frontend calls.
- Completed: Confirm admissions backend routes are registered before catch-all.
- Completed: Confirm teacher attendance backend routes are registered before catch-all.
- Completed: Confirm School Admin attendance backend routes are registered before catch-all.
- Completed: Confirm browser calls use `/api`, not `/v1`.
- Completed: Identify exact root cause.
- Completed: Fix only the actual cause.
- Completed: Preserve `/v1` backend prefix and `/api` frontend prefix.
- Completed: Avoid fake data/static rows.
- Completed: Run required validation.
- Completed: Create Phase 5-Fix implementation report.
- Completed: Create Phase 5-Fix manual QA document.
- Completed: Stop before Phase 6.

## Result

Local code already contains the required route and proxy wiring. No application behavior change was required. The live errors are consistent with a stale or unsynced API deployment, or a web deployment pointing at an older API preview origin.
