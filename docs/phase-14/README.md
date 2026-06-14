# Phase 14 - HR & Payroll

Project: School ERP Management System  
Phase status: Approved  
Prepared on: 2026-06-12

## Scope

Phase 14 implements the HR & Payroll module with employees, leaves, payroll, salary slips, CSV exports, audit logging, and school-scoped RBAC.

## Implemented Features

| Feature | Status |
| --- | --- |
| Dashboard | Implemented with employee, leave, payroll, salary slip, and payroll amount counts |
| Employees | CRUD, search, status filters, pagination, export |
| Leaves | CRUD, search, status filters, pagination, export |
| Payroll | CRUD, search, status filters, pagination, export |
| Salary Slips | CRUD, search, status filters, pagination, export |

## Technical Deliverables

| Area | Deliverable |
| --- | --- |
| Database | Phase 14 migration adds HR employees, leaves, payroll records, and salary slips |
| Seed Data | Demo school receives HR Officer account and sample employee, leave, payroll, and salary slip records |
| API | `/api/v1/hr` route with dashboard, CRUD, pagination, search, status filtering, CSV export, and audit logging |
| Web Proxy | `/api/hr/[...path]` forwards authenticated browser requests to the API |
| UI | `/hr` renders the HR & Payroll workspace |
| Navigation | School Admin and HR Officer navigation includes HR |
| RBAC | School Admin and HR Officer receive `hr.manage`; Finance Officer and other roles are blocked |

## Application URLs

| Service | URL |
| --- | --- |
| Web HR Portal | `http://localhost:3000/hr` |
| API HR Base | `http://localhost:4000/api/v1/hr` |
| PostgreSQL | `localhost:5433` |

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| School Admin | `admin@demo-academy.local` | `Password123!` |
| HR Officer | `hr@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 15 was approved by the user on 2026-06-12.
