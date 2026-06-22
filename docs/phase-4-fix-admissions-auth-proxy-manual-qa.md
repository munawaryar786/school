# Phase 4-Fix Admissions Authentication And Proxy Flow Manual QA

## School Admin Admissions QA

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Admissions.
4. Confirm the form does not show `Authentication is required`.
5. Confirm Admission records load or show the empty state.
6. In browser Network tools, confirm list uses `/api/school-admin/admissions`.
7. Confirm no browser request goes directly to `/v1/school-admin/admissions`.
8. Create an admission applicant.
9. Move the applicant to `UNDER_REVIEW`.
10. Approve the applicant.
11. Convert the applicant to a student.
12. Open Students.
13. Confirm the converted student appears.
14. Return to Dashboard.
15. Confirm Admissions and Students readiness/counts refresh.

## Failure Checks

1. Confirm no raw `Authentication is required` appears while logged in.
2. Confirm no raw `Route not found` appears.
3. Confirm no raw `School Admin resource not found` appears.
4. Confirm route/deployment failures show `Admissions API is unavailable. Retry after deployment.`
5. Confirm unauthenticated state shows `Please log in again to continue.`
6. Confirm Admissions uses `/api`, not direct `/v1`.
7. Confirm no fake data appears.
8. Confirm cross-school data is not visible.
