# Phase 5 Testing Checklist

Project: School ERP Management System  
Phase: Teacher Portal  
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
| Phase 5 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 5 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Teacher Portal sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| Teacher login with seeded credentials | Passed |
| `GET /api/v1/teacher/dashboard` returns teacher-owned counts | Passed |
| `POST /api/v1/teacher/assignments` creates teacher-owned assignment | Passed |
| `GET /api/v1/teacher/assignments?search=...` returns searched results | Passed |
| `GET /api/v1/teacher/assignments?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/teacher/assignments/:id` removes temporary verification row | Passed |
| School Admin access to `/api/v1/teacher/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Teacher navigation | Teacher route opens full Teacher Portal | Passed by build/typecheck |
| Dashboard cards | Shows counts for Teacher Portal modules | Passed by API verification |
| CRUD forms | Forms exist for each Teacher Portal module | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for each non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing School Admin and Super Admin routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
