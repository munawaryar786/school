# Phase 14 Testing Checklist

Project: School ERP Management System  
Phase: HR & Payroll  
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
| Phase 14 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 14 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with HR sample records and HR Officer account | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| HR Officer login with seeded credentials | Passed |
| `GET /api/v1/hr/dashboard` returns HR counts and payroll aggregate | Passed |
| `POST /api/v1/hr/employees` creates a school-owned employee | Passed |
| `GET /api/v1/hr/employees?search=...` returns searched results | Passed |
| `GET /api/v1/hr/employees?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/hr/employees/:id` removes temporary verification row | Passed |
| Finance Officer access to `/api/v1/hr/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| HR navigation | School Admin and HR Officer can navigate to `/hr` | Passed by build/typecheck |
| HR route protection | `/hr` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows HR counts and payroll total | Passed by API verification |
| CRUD forms | Forms exist for employees, leaves, payroll, and salary slips | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, and Finance routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
