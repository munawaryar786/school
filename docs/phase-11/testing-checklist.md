# Phase 11 Testing Checklist

Project: School ERP Management System  
Phase: Examination  
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
| Phase 11 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 11 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Examination sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/examination/dashboard` returns examination counts | Passed |
| `POST /api/v1/examination/questions` creates a school-owned question bank item | Passed |
| `GET /api/v1/examination/questions?search=...` returns searched results | Passed |
| `GET /api/v1/examination/questions?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/examination/questions/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/examination/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Examination navigation | School Admin, Teacher, and Staff can navigate to `/examination` | Passed by build/typecheck |
| Examination route protection | `/examination` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows schedule, question, online exam, result, and report card counts | Passed by API verification |
| CRUD forms | Forms exist for schedules, question bank, online exams, results, and report cards | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, and Attendance routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
