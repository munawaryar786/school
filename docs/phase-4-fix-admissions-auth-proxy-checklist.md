# Phase 4-Fix Admissions Authentication And Proxy Flow Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Fix Admissions authentication/proxy behavior only. Do not start Phase 5 or implement attendance, timetable, exams, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Inspect School Admin portal admissions request code.
- Completed: Inspect working School Admin resource request code.
- Completed: Inspect `/api/school-admin` proxy route.
- Completed: Inspect backend admissions route registration and middleware.
- Completed: Identify exact root cause of Admissions auth/proxy failure.
- Completed: Fix admissions requests to use the same authenticated `/api` flow as working resources.
- Completed: Fix proxy forwarding only if needed.
- Completed: Fix backend only if needed.
- Completed: Improve Admissions auth/proxy error messages.
- Completed: Preserve `/v1` backend prefix and `/api` frontend prefix.
- Completed: Avoid fake data/static rows.
- Completed: Run required validation.
- Completed: Create Phase 4-Fix implementation report.
- Completed: Create Phase 4-Fix manual QA document.
- Completed: Stop before Phase 5.

## Notes

- Admissions was already calling `/api/school-admin/admissions`; no direct `/v1` or hardcoded API origin was found.
- The shared School Admin browser request helper now explicitly sends same-origin credentials and disables cache.
- The `/api/school-admin/[...path]` proxy already forwards cookies as `Authorization: Bearer <token>` to `/v1/school-admin/...`.
- Backend admissions routes already exist before the generic `/:resource` fallback.
