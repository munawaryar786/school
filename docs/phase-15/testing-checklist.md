# Phase 15 Testing Checklist

Project: School ERP Management System  
Phase: Library Module  
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
| Phase 15 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 15 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Library sample records and Librarian account | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| Librarian login with seeded credentials | Passed |
| `GET /api/v1/library/dashboard` returns library counts and fine aggregate | Passed |
| `POST /api/v1/library/books` creates a school-owned book | Passed |
| `GET /api/v1/library/books?search=...` returns searched results | Passed |
| `GET /api/v1/library/books?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/library/books/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/library/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Library navigation | School Admin and Librarian can navigate to `/library` | Passed by build/typecheck |
| Library route protection | `/library` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows library counts, availability, pending fines, and fine total | Passed by API verification |
| CRUD forms | Forms exist for books, issues, returns, and fines | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, and HR routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
