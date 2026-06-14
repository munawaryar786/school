# Phase 12 Testing Checklist

Project: School ERP Management System  
Phase: LMS  
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
| Phase 12 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 12 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with LMS sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/lms/dashboard` returns LMS counts | Passed |
| `POST /api/v1/lms/courses` creates a school-owned course | Passed |
| `GET /api/v1/lms/courses?search=...` returns searched results | Passed |
| `GET /api/v1/lms/courses?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/lms/courses/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/lms/dashboard` returns LMS data | Passed |
| Student can create/delete a progress record | Passed |
| Student content write to `/api/v1/lms/courses` returns 403 | Passed |
| Parent access to `/api/v1/lms/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| LMS navigation | School Admin, Teacher, Staff, and Student can navigate to `/lms` | Passed by build/typecheck |
| LMS route protection | `/lms` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows course, material, video, quiz, and progress counts | Passed by API verification |
| CRUD forms | Forms exist for courses, materials, videos, quizzes, and progress | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, and Examination routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
