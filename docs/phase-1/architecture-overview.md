# Architecture Overview

Project: School ERP Management System  
Phase: 1 - System Architecture

## Architecture Goals

- Production-grade multi-school SaaS with strict tenant isolation.
- Modular codebase that supports phased delivery without replacing foundations later.
- Shared validation and type safety between frontend and backend.
- Enterprise security posture: JWT auth, RBAC, audit logging, 2FA-ready flows, secure uploads, API hardening.
- Handcrafted SaaS UI with role-aware navigation and consistent color semantics.
- Extensible reporting, file storage, notifications, exports, and mobile API support.

## System Style

The system will use a modular monorepo with separate deployable web and API applications:

| Application | Technology | Responsibility |
| --- | --- | --- |
| Web app | Next.js App Router, React, TypeScript, TailwindCSS, Shadcn UI | Role portals, protected layouts, forms, data tables, dashboards, reports UI |
| API app | Node.js, Express.js, TypeScript | REST API, authentication, authorization, business services, integrations |
| Database | PostgreSQL with Prisma ORM | Transactional source of truth |
| Storage | S3-compatible object storage | Documents, LMS media, CMS media, exports, backups, certificates |
| Shared package | TypeScript, Zod | Shared schemas, API contracts, permissions, constants |
| Worker package | Node.js, TypeScript | Background jobs for exports, notifications, backups, emails, report generation |

## Architectural Principles

| Principle | Application |
| --- | --- |
| Tenant isolation first | Every school-scoped table includes `schoolId`; all API access resolves a tenant context before querying data. |
| RBAC in API and UI | UI navigation hides unauthorized actions, but backend permission checks remain authoritative. |
| Shared contracts | Zod schemas define request validation, response shapes, and form validation wherever practical. |
| Module boundaries | Features live in domain modules with routes, services, validators, policies, and tests grouped together. |
| Auditability | Sensitive actions produce structured audit events with actor, tenant, resource, action, and metadata. |
| Consistent async UX | All async UI includes loading, error, empty, and success states. |
| Exportable data tables | Admin data tables use shared search, filter, pagination, sorting, and export conventions. |

## Core Domains

| Domain | Purpose |
| --- | --- |
| Identity and Access | Users, roles, permissions, sessions, 2FA, invitations, password flows |
| Tenancy | Schools, campuses, subscription state, tenant settings |
| Academic Core | Academic years, terms, classes, sections, subjects, curriculum, timetable |
| People | Students, guardians, teachers, staff, employees |
| Learning | LMS courses, materials, quizzes, assignments, progress |
| Attendance | Student, teacher, and staff attendance plus notifications |
| Examination | Exams, question bank, online exams, results, report cards |
| Finance | Fees, invoices, payments, scholarships, discounts, ledger, expenses |
| Operations | Library, documents, certificates, meetings, CMS, communications |
| Platform | Audit logs, system settings, backups, reports, exports, observability |

## Deployment Topology

| Component | Runtime | Scaling Strategy |
| --- | --- | --- |
| Next.js web | Node.js hosting platform | Horizontal scaling behind CDN/load balancer |
| Express API | Node.js service | Horizontal scaling; stateless JWT/session model |
| Worker | Node.js service | Queue-driven horizontal workers |
| PostgreSQL | Managed database | Vertical scaling, read replicas later if needed |
| Object storage | S3-compatible provider | Provider-managed scaling |
| Cache/queue | Redis-compatible service | Sessions/rate limits/cache/queues |

## Required Shared Infrastructure

| Infrastructure | Use |
| --- | --- |
| PostgreSQL | Main application data |
| Redis-compatible service | Rate limiting, queues, short-lived cache, idempotency locks |
| S3-compatible storage | File uploads, exports, report PDFs, backups |
| Email provider | Invitations, password reset, notifications, reports |
| SMS provider | Attendance and finance alerts |
| Push provider | Mobile notifications |
| Payment provider | Parent fee payments and reconciliation |
| Error monitoring | API and frontend exceptions |
| Structured logging | Audit, support, and security investigations |

## Phase 2 Implementation Boundary

Phase 2 should implement only the foundation required by later phases:

- Monorepo setup.
- Next.js web app.
- Express API app.
- Prisma/PostgreSQL setup.
- Auth, JWT, sessions, RBAC guard scaffolding.
- Theme and layout system.
- Shared components and shared validation package.
- Login, logout, protected routes, and role-aware navigation shell.

