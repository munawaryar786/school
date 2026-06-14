# Phase 21 - Website CMS

Project: School ERP Management System  
Phase status: Approved  
Prepared on: 2026-06-13

## Scope

Phase 21 implements Website CMS with website builder pages, blog posts, news, announcements, admission pages, CSV exports, audit logging, and school-scoped RBAC.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with page, blog, news, announcement, admission page, published, and draft counts |
| Website Builder | CRUD, search, status filters, pagination, export |
| Blog | CRUD, search, status filters, pagination, export |
| News | CRUD, search, status filters, pagination, export |
| Announcements | CRUD, search, status filters, pagination, export |
| Admission Pages | CRUD, search, status filters, pagination, export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 21 migration adds website pages, blog posts, news items, website announcements, and CMS admission pages |
| Seed Data | Demo school receives sample CMS records for every resource |
| API | `/api/v1/cms` route with dashboard, CRUD, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/cms/[...path]` forwards authenticated browser requests to the API |
| UI | `/cms` renders the Website CMS workspace |
| Navigation | School Admin and Staff navigation includes Website CMS |
| RBAC | School Admin and Staff receive `cms.manage`; Student is blocked |

## Application URLs

| Service | URL |
| --- | --- |
| Web CMS Portal | `http://localhost:3000/cms` |
| API CMS Base | `http://localhost:4000/api/v1/cms` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| School Admin | `admin@demo-academy.local` | `Password123!` |
| Staff | `staff@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 22 was approved by the user on 2026-06-13.
