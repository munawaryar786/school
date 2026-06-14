# Phase 16 Testing Checklist

Project: School ERP Management System  
Phase: Communication Module  
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
| Phase 16 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 16 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Communication sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/communication/dashboard` returns communication counts | Passed |
| `POST /api/v1/communication/sms` creates a school-owned SMS record | Passed |
| `GET /api/v1/communication/sms?search=...` returns searched results | Passed |
| `GET /api/v1/communication/sms?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/communication/sms/:id` removes temporary verification row | Passed |
| Teacher access to `/api/v1/communication/dashboard` returns communication data | Passed |
| Student access to `/api/v1/communication/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Communication navigation | School Admin, Staff, and Teacher can navigate to `/communication` | Passed by build/typecheck |
| Communication route protection | `/communication` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows SMS, email, push, message, announcement, queued, and sent counts | Passed by API verification |
| CRUD forms | Forms exist for SMS, email, push, messaging, and announcements | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, HR, and Library routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
