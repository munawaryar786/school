# Phase 5-Fix API Route Sync Manual QA

## Prerequisites

- Latest API preview is deployed from `phase-32-single-school-premium`.
- Latest web preview is deployed after the API preview.
- Web `NEXT_PUBLIC_API_URL` points to the latest API preview origin.
- API `WEB_ORIGIN` points to the latest web preview origin.
- Origins have no trailing slash and do not include `/api` or `/v1`.
- Required database migrations for admissions and attendance are already applied in the target database.

## QA Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Admissions.
4. Confirm no `Admissions API is unavailable. Retry after deployment.` message appears.
5. Confirm admission records load.
6. Create an admission applicant.
7. Move the admission to `UNDER_REVIEW`.
8. Approve the admission.
9. Convert the approved admission to student.
10. Confirm the converted student appears in Students.
11. Login as an assigned Teacher.
12. Open Attendance Marking.
13. Confirm no `Route not found` message appears.
14. Confirm assigned class context loads.
15. Select class, section if needed, and date.
16. Load assigned class students.
17. Mark attendance and save.
18. Login as School Admin.
19. Open Attendance monitoring.
20. Confirm saved attendance records and counts appear.
21. Login as Parent.
22. Confirm linked child attendance appears.

## Failure Checks

- Browser does not call `/v1` directly.
- Admissions calls use `/api/school-admin/admissions`.
- Teacher attendance calls use `/api/teacher/attendance/...`.
- School Admin attendance calls use `/api/school-admin/attendance...`.
- No raw `Route not found` appears.
- No fake data appears.
- Parent cannot see unrelated child attendance.
- Teacher cannot mark attendance for an unassigned class.
- School Admin data remains school-scoped.
