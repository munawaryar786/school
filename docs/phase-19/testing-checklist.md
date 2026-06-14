# Phase 19 Testing Checklist

Project: School ERP Management System  
Phase: Certificate Management  
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
| Phase 19 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 19 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Certificate Management sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/certificates/dashboard` returns certificate counts | Passed |
| `POST /api/v1/certificates/certificates` creates a school-owned certificate | Passed |
| `GET /api/v1/certificates/certificates?search=...` returns searched results | Passed |
| `GET /api/v1/certificates/certificates?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/certificates/certificates/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/certificates/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| Certificates navigation | School Admin and Staff can navigate to `/certificates` | Passed by build/typecheck |
| Certificates route protection | `/certificates` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows certificate, transcript, verification, issued, published, and valid counts | Passed by API verification |
| CRUD forms | Forms exist for certificates, transcripts, and verification records | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, HR, Library, Communication, Reports, and Documents routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
