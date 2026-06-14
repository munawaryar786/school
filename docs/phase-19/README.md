# Phase 19 - Certificate Management

Project: School ERP Management System  
Phase status: Approved  
Prepared on: 2026-06-13

## Scope

Phase 19 implements Certificate Management with certificates, transcripts, verification records, CSV exports, audit logging, and school-scoped RBAC.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with certificate, transcript, verification, issued, published, and valid counts |
| Certificates | CRUD, search, status filters, pagination, export |
| Transcripts | CRUD, search, status filters, pagination, export |
| Verification | CRUD, search, status filters, pagination, export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 19 migration adds certificate records, transcript records, and certificate verification records |
| Seed Data | Demo school receives sample certificate, transcript, and verification records |
| API | `/api/v1/certificates` route with dashboard, CRUD, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/certificates/[...path]` forwards authenticated browser requests to the API |
| UI | `/certificates` renders the Certificate Management workspace |
| Navigation | School Admin and Staff navigation includes Certificates |
| RBAC | School Admin and Staff receive `certificates.manage`; Student is blocked |

## Application URLs

| Service | URL |
| --- | --- |
| Web Certificates Portal | `http://localhost:3000/certificates` |
| API Certificates Base | `http://localhost:4000/api/v1/certificates` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| School Admin | `admin@demo-academy.local` | `Password123!` |
| Staff | `staff@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 20 was approved by the user on 2026-06-13.
