# Phase 9 - Academic

Project: School ERP Management System  
Phase status: Approved to proceed to Phase 10  
Prepared on: 2026-06-12

## Scope

Phase 9 implements the Academic module with academic years, terms, classes, sections, subjects, curriculum planning, CSV exports, audit logging, and school-scoped RBAC.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with academic year, term, class, section, subject, and curriculum counts |
| Academic Years | CRUD, search, filters, pagination, export |
| Terms | CRUD, search, filters, pagination, export |
| Classes | CRUD, search, filters, pagination, export |
| Sections | CRUD, class ownership validation, search, filters, pagination, export |
| Subjects | CRUD, search, filters, pagination, export |
| Curriculum | CRUD, search, filters, pagination, export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 9 migration adds academic terms and curriculum plans |
| Reused Models | Existing academic years, classes, sections, and subjects are surfaced through the dedicated Academic module |
| Seed Data | Demo school receives academic year, term, class, section, subject, and curriculum data |
| API | `/api/v1/academic` route with dashboard, CRUD, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/academic/[...path]` forwards authenticated browser requests to the API |
| UI | `/academic` renders the Academic workspace |
| Navigation | School Admin and Staff navigation includes Academic |
| RBAC | School Admin and Staff receive `academic.manage`; other roles are blocked from Academic API operations |

## Application URLs

| Service | URL |
| --- | --- |
| Web Academic Portal | `http://localhost:3000/academic` |
| API Academic Base | `http://localhost:4000/api/v1/academic` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| School Admin | `admin@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 10 was approved by the user on 2026-06-12.
