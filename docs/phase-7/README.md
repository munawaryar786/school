# Phase 7 - Parent Portal

Project: School ERP Management System  
Phase status: Approved to proceed to Phase 8  
Prepared on: 2026-06-12

## Scope

Phase 7 implements the Parent Portal with child profile access, child attendance, results, performance analytics, homework, fee status, parent payments, and school communication.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with child count, module counts, child cards, and performance summary |
| Child Profile | View, search, filter, paginate, export |
| Attendance | View child attendance, search, filter, paginate, export |
| Results | View child marks/results, search, filter, paginate, export |
| Performance | View calculated attendance rate, average score, open homework, pending fees, and paid payments |
| Homework | View teacher-published homework |
| Fee Status | View fee records |
| Fee Payments | Create, view, delete own parent payment records; export |
| Communication | View teacher messages and create/delete parent messages; export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 7 migration adds parent-owned fee payments and portal messages |
| Seed Data | Demo parent receives payment and message records linked to `Student User` |
| API | `/api/v1/parent` route with child-scoped reads, computed performance, parent-owned writes, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/parent/[...path]` forwards authenticated browser requests to the API |
| UI | `/parent` now renders the Parent Portal instead of the foundation dashboard |
| RBAC | Parents receive `parent.portal.access`; non-parent roles are blocked from Parent Portal API operations |

## Application URLs

| Service | URL |
| --- | --- |
| Web Parent Portal | `http://localhost:3000/parent` |
| API Parent Base | `http://localhost:4000/api/v1/parent` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Parent | `parent@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 8 was approved by the user on 2026-06-12.
