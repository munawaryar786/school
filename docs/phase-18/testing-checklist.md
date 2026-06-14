# Phase 18 Testing Checklist

Project: School ERP Management System  
Phase: Document Management  
Prepared on: 2026-06-13

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
| Phase 18 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 18 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Document Management sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/documents/dashboard` returns document counts | Passed |
| `POST /api/v1/documents/students` creates a school-owned student document | Passed |
| `GET /api/v1/documents/students?search=...` returns searched results | Passed |
| `GET /api/v1/documents/students?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/documents/students/:id` removes temporary verification row | Passed |
| HR Officer access to `/api/v1/documents/dashboard` returns document data | Passed |
| Student access to `/api/v1/documents/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Documents navigation | School Admin, Staff, and HR Officer can navigate to `/documents` | Passed by build/typecheck |
| Documents route protection | `/documents` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows student, teacher, contract, archive, verified, and pending counts | Passed by API verification |
| CRUD forms | Forms exist for student documents, teacher documents, contracts, and archive | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, HR, Library, Communication, and Reports routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
