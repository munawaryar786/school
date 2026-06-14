# Phase 8 Testing Checklist

Project: School ERP Management System  
Phase: Admissions  
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
| Phase 8 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 8 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema relation fix | Passed |
| Seed script completed with Admissions sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/admissions/dashboard` returns admissions counts | Passed |
| `POST /api/v1/admissions/applications` creates school-owned application | Passed |
| `GET /api/v1/admissions/applications?search=...` returns searched results | Passed |
| `GET /api/v1/admissions/applications?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/admissions/applications/:id` removes temporary verification row | Passed |
| Teacher access to `/api/v1/admissions/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Admissions navigation | School Admin and Staff can navigate to `/admissions` | Passed by build/typecheck |
| Admissions route protection | `/admissions` is protected by middleware for School Admin and Staff | Passed by build/typecheck |
| Dashboard cards | Shows admissions pipeline counts | Passed by API verification |
| CRUD forms | Forms exist for applications, enrollments, documents, and reports | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, and Parent routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
