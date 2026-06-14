# Phase 6 Testing Checklist

Project: School ERP Management System  
Phase: Student Portal  
Prepared on: 2026-06-12

## Automated Checks

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck --workspace @school-erp/shared` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/api` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/web` | Passed |
| `npm.cmd run typecheck --workspace @school-erp/ui` | Passed |
| `npm.cmd run test --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/api` | Passed |
| `npm.cmd run build --workspace @school-erp/web` | Passed |

## Database Checks

| Check | Result |
| --- | --- |
| Phase 6 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 6 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Student Portal sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| Student login with seeded credentials | Passed |
| `GET /api/v1/student/dashboard` returns student profile and counts | Passed |
| `POST /api/v1/student/submissions` creates student-owned submission | Passed |
| `GET /api/v1/student/submissions?search=...` returns searched results | Passed |
| `GET /api/v1/student/submissions?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/student/submissions/:id` removes temporary verification row | Passed |
| Teacher access to `/api/v1/student/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Student navigation | Student route opens full Student Portal | Passed by build/typecheck |
| Dashboard cards | Shows counts for Student Portal modules | Passed by API verification |
| Read-only resources | Attendance, timetable, assignments, materials, results, exams, certificates, transcripts, and fees list without write controls | Passed by build/typecheck |
| Action forms | Submissions, exam attempts, and payments support own-record creation | Passed by build/typecheck and API verification |
| Tables | Tables support loading, empty, error, data, delete where allowed, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for each non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, and Teacher routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
