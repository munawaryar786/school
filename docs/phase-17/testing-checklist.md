# Phase 17 Testing Checklist

Project: School ERP Management System  
Phase: Reports & Analytics  
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
| Phase 17 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 17 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Reports & Analytics sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/reports/dashboard` returns report counts and aggregates | Passed |
| `POST /api/v1/reports/student-reports` creates a school-owned report | Passed |
| `GET /api/v1/reports/student-reports?search=...` returns searched results | Passed |
| `GET /api/v1/reports/student-reports?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/reports/student-reports/:id` removes temporary verification row | Passed |
| Finance Officer access to `/api/v1/reports/dashboard` returns report data | Passed |
| Student access to `/api/v1/reports/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Reports navigation | School Admin, Staff, Finance Officer, and HR Officer can navigate to `/reports` | Passed by build/typecheck |
| Reports route protection | `/reports` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows report counts and attendance/financial aggregates | Passed by API verification |
| CRUD forms | Forms exist for student, teacher, attendance, financial, and dashboard reports | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, HR, Library, and Communication routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
