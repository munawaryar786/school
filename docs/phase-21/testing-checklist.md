# Phase 21 Testing Checklist

Project: School ERP Management System  
Phase: Website CMS  
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
| Phase 21 migration SQL executed against embedded PostgreSQL on port 5433 | Passed |
| Phase 21 migration marked applied in Prisma history | Passed |
| Prisma Client generated after schema changes | Passed |
| Seed script completed with Website CMS sample records | Passed |

## API Functional Checks

| Check | Result |
| --- | --- |
| School Admin login with seeded credentials | Passed |
| `GET /api/v1/cms/dashboard` returns CMS counts | Passed |
| `POST /api/v1/cms/news` creates a school-owned news item | Passed |
| `GET /api/v1/cms/news?search=...` returns searched results | Passed |
| `GET /api/v1/cms/news?format=csv` returns `text/csv` | Passed |
| `DELETE /api/v1/cms/news/:id` removes temporary verification row | Passed |
| Student access to `/api/v1/cms/dashboard` returns 403 | Passed |

## UI Checklist

| Area | Expected Result | Status |
| --- | --- | --- |
| CMS navigation | School Admin and Staff can navigate to `/cms` | Passed by build/typecheck |
| CMS route protection | `/cms` is protected by middleware for allowed roles | Passed by build/typecheck |
| Dashboard cards | Shows pages, blog posts, news, announcements, admission pages, published, and draft counts | Passed by API verification |
| CRUD forms | Forms exist for website pages, blog posts, news, announcements, and admission pages | Passed by build/typecheck |
| Tables | Tables support loading, empty, error, data, delete, and pagination states | Passed by build/typecheck |
| Search/filter/export | Toolbar is available for every non-dashboard module | Passed by build/typecheck |

## Regression Checklist

| Area | Result |
| --- | --- |
| Existing AuthService tests | Passed |
| Existing Super Admin, School Admin, Teacher, Student, Parent, Admissions, Academic, Attendance, Examination, LMS, Finance, HR, Library, Communication, Reports, Documents, Certificates, and Meetings routes remain mounted | Passed by API build |
| Existing protected route structure remains valid | Passed by web build |
| Existing shared permission typings remain valid | Passed |
