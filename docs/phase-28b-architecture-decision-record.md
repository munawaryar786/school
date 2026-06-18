# Phase 28B Architecture Decision Record

Status: Proposed for Project Owner approval.

Phase 28B starts from the Phase 28A audit and does not perform Phase 28C stabilization work. No production routing, Prisma schema, migrations, environment variables, deployment settings, or module CRUD behavior are changed by this document.

## Approved Starting Point

The Project Owner approved starting Phase 28B on 2026-06-18.

Phase 28B scope:

- Convert the Phase 28A audit findings into an approved target architecture.
- Define the enterprise design-system architecture.
- Define role-portal, navigation, RBAC, tenant isolation, workflow, notification, reporting, security, and observability architecture.
- Define the acceptance gate for Phase 28C.

Not in Phase 28B:

- No Prisma schema changes.
- No backend route changes.
- No frontend workflow rewrites.
- No production deployment changes.
- No database writes.
- No optional enterprise-module implementation.

## Non-Negotiable Production Guardrails

| Decision | Status | Rationale |
| --- | --- | --- |
| Preserve `GET /health` | Proposed Approved | Current production health endpoint is verified in source and reported working |
| Preserve backend `/v1` public route prefix | Proposed Approved | Current frontend proxy and Vercel routing depend on it |
| Preserve frontend `/api/*` proxy routes | Proposed Approved | Browser calls must continue through frontend proxy |
| Do not restore backend `/api/v1` | Proposed Approved | Prior Vercel conflict risk remains unresolved |
| Preserve Vercel roots `apps/api` and `apps/web` | Proposed Approved | Current production setup depends on these roots |
| Preserve Express default export | Proposed Approved | Current serverless deployment shape depends on it |
| Preserve Node.js 22 compatibility | Proposed Approved | Root and API package engines specify Node 22 |
| Preserve shared package built-output contract | Proposed Approved | Prevents prior module-format conflict |

## Target Platform Architecture

Retain the current stack:

- Next.js App Router frontend.
- Express TypeScript backend.
- Prisma ORM.
- PostgreSQL/Neon.
- JWT authentication.
- REST API.
- npm workspaces.
- Vercel deployment.

Refactor direction after approval:

- Move business logic out of route files into services.
- Move direct Prisma calls behind repositories or query services where complexity warrants it.
- Introduce a tenant policy layer before expanding modules.
- Introduce a route-policy registry used by backend permissions, frontend navigation, and tests.
- Keep the current proxy boundary: browser to `/api/*`, proxy to backend `/v1/*`.

## Target Backend Layering

| Layer | Responsibility | Phase |
| --- | --- | --- |
| Route/controller | HTTP parsing, response mapping, status codes | 28C onward |
| Request validation | Zod schemas, shared where useful | 28C onward |
| Policy service | Auth, role, permission, school, campus, object access | 28C |
| Domain service | Transactional business workflow | 28D |
| Repository/query service | Prisma access with tenant filters | 28C onward |
| Audit service | Required audit records and metadata | 28C onward |
| Integration adapter | Provider-specific email, SMS, payment, storage, webhooks | 28D onward |

## Target Frontend Layering

| Layer | Responsibility | Phase |
| --- | --- | --- |
| App shell | Role shell, responsive navigation, top bar, user context | 28B/28C |
| Route pages | Server or client page composition | 28C onward |
| Feature views | Domain workflow screens | 28D |
| Shared components | Tables, forms, filters, dialogs, states, cards | 28B/28C |
| API clients | Typed fetch wrappers against `/api/*` | 28C |
| Policy metadata | Page visibility, required permissions, breadcrumbs | 28C |
| Theme provider | Light/dark/system/high-contrast state | 28C |

## Role and Portal Architecture

Target role set:

- `SUPER_ADMIN`
- `SCHOOL_ADMIN`
- `TEACHER`
- `STUDENT`
- `PARENT`
- `FINANCE_OFFICER`
- `HR_OFFICER`
- `LIBRARIAN`
- `ADMISSIONS_OFFICER`
- Configurable staff roles

Current missing role:

- `ADMISSIONS_OFFICER` is absent from shared roles and Prisma enum. It must not be patched casually; it requires RBAC, seed, migration, navigation, and E2E coverage in Phase 28C.

Portal principle:

- Each role gets a real workflow-oriented portal.
- Shared modules remain consistent, but the landing page, navigation, task queues, default filters, and allowed actions are role-specific.
- Hiding UI is not authorization. Server-side policies remain authoritative.

## Multi-Tenancy and Campus Architecture

Target hierarchy:

- Platform
- School
- Campus
- Department or operational unit where needed
- User membership
- Role assignment
- Permission policy
- Object-level access

Tenant-isolation strategy:

1. Every school-owned record must include `schoolId`.
2. Campus-scoped records include `campusId` when applicable.
3. All school/campus queries go through a tenant policy helper or repository method.
4. Parent, student, and teacher portal access uses durable relationship tables, not names.
5. Exports and reports require explicit scoped permissions.
6. PostgreSQL RLS is assessed after application-level policy is centralized.

## Security Architecture

Phase 28C must address:

- Refresh endpoint and token rotation decision.
- Session/device management.
- Login history.
- Brute-force protection and lockout.
- Server-side membership status validation.
- Fine-grained CRUD/export/approval permissions.
- Object-level authorization tests.
- Step-up authentication for destructive and sensitive operations.
- Audit logging as a policy, not a route-by-route habit.

## Workflow Architecture

Approve reusable workflow engine for:

- Admission approval.
- Student transfer and promotion.
- Fee discount, refund, and expense approval.
- Leave and attendance correction.
- Marks correction and result publication.
- Document verification.
- Payroll and purchase approval.
- User access and data export approval.

Workflow states:

- Draft
- Submitted
- Under review
- Approved
- Rejected
- Returned
- Cancelled
- Escalated

## Reporting and Analytics Architecture

Target:

- Role dashboards.
- Operational dashboards.
- Filterable reports.
- Saved reports.
- Scheduled reports.
- CSV, Excel, PDF, and print exports.
- PII masking.
- Report audit logs.
- Accessible charts with textual summaries.

Reports must not bypass tenant, campus, role, or object policies.

## Integration Architecture

Use provider adapters for:

- Email.
- SMS.
- Push.
- WhatsApp readiness.
- Payment gateways.
- Cloud storage.
- Video meetings.
- Accounting.
- SSO.
- Webhooks.

Each adapter requires:

- Credential isolation.
- Retry policy.
- Idempotency.
- Provider health status.
- Event log.
- Dead-letter handling where asynchronous.

## Phase 28C Entry Gate

Phase 28C may begin only after Project Owner explicitly approves:

- This architecture decision record.
- `phase-28b-design-system-specification.md`.
- `phase-28b-component-ux-architecture.md`.
- `phase-28b-phase-28c-readiness-gate.md`.

