# Phase 2 - Foundation Setup

Project: School ERP Management System  
Phase status: Approved; Phase 3 started  
Prepared on: 2026-06-12

## Scope

Phase 2 implements the production foundation for the SaaS application:

- Monorepo workspace
- Next.js App Router web application
- Express.js TypeScript API
- Prisma/PostgreSQL schema foundation
- JWT authentication service
- RBAC permission model
- Protected route middleware
- Role-aware layout and theme system
- Shared validation/types package
- Shared UI utilities
- Login/logout flow
- Foundation dashboards for approved Phase 2 role shells

## Implemented Deliverables

| Deliverable | Status | Evidence |
| --- | --- | --- |
| Project setup | Implemented | Root npm workspace, `apps/web`, `apps/api`, `packages/shared`, `packages/ui`, `prisma` |
| Prisma | Implemented | `prisma/schema.prisma`, Prisma client generation passed |
| PostgreSQL | Implemented and verified | Workspace-local embedded PostgreSQL 16 runs on `localhost:5433` |
| Auth | Implemented | API login/logout/me routes, JWT access token, refresh token session storage model |
| RBAC | Implemented | Shared roles/permissions, API permission middleware, route role guards |
| Theme system | Implemented | Role color tokens for Super Admin, School Admin, Teacher, Student, Parent, Academic, Security |
| Layout system | Implemented | Protected app shell with role-aware navigation |
| Shared components | Implemented | UI utility package and foundation dashboard components |
| Running application | Verified | API health 200 on `http://localhost:4000/health`; web login 200 on `http://localhost:3000/login` |
| Authentication working | Verified | Seeded DB-backed API login, `/auth/me`, logout, web login cookie issuance, dashboard route guard, and role mismatch guard verified |

## Local URLs

| Service | URL | Status |
| --- | --- | --- |
| Web app | `http://localhost:3000/login` | Running |
| API health | `http://localhost:4000/health` | Running |

## Database Runtime

Phase 2 uses a workspace-local embedded PostgreSQL 16 instance on `localhost:5433`. To start it manually:

```powershell
$env:PGPORT='5433'
$env:PGDATA_DIR='.data/postgres16'
npm.cmd run db:start
```

DB-backed verification commands:

```powershell
$env:DATABASE_URL='postgresql://school_erp:school_erp@localhost:5433/school_erp?schema=public'
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
```

Development seed credentials after migration:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `super.admin@schoolerp.local` | `Password123!` |
| School Admin | `admin@demo-academy.local` | `Password123!` |
| Teacher | `teacher@demo-academy.local` | `Password123!` |
| Student | `student@demo-academy.local` | `Password123!` |
| Parent | `parent@demo-academy.local` | `Password123!` |

## Approval Gate

Phase 3 was started after stakeholder approval.

Required approval statement:

```text
Approved to start Phase 3.
```
