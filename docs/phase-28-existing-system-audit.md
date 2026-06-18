# Phase 28A Existing-System Audit

Status: Completed for static audit, with runtime validation blocked by local PowerShell/Node memory failures.

## Scope and Evidence

Audited repository: `E:\saas`, branch `main`, monorepo `school-erp`.

Evidence inspected:

- Root workspace metadata: `package.json`, `package-lock.json` presence, `tsconfig.base.json`.
- Workspace package metadata: `apps/api/package.json`, `apps/web/package.json`, `packages/shared/package.json`, `packages/ui/package.json`.
- Backend app wiring: `apps/api/src/app.ts`, `apps/api/src/server.ts`, `apps/api/index.ts`, `apps/api/api/index.js`.
- Backend env, middleware, auth, audit and representative route modules.
- Frontend proxy, middleware, auth, app shell, login, and representative portal components.
- Prisma schema model/index evidence from `prisma/schema.prisma`.
- Existing docs inventory under `docs/phase-*` and deployment docs.
- Benchmark research attempted against official product sites only.

## Current Architecture

The system is an npm workspaces monorepo:

| Layer | Current implementation |
| --- | --- |
| Backend | Express 4, TypeScript, CommonJS package, Prisma ORM, JWT auth |
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS |
| Shared | `@school-erp/shared` CommonJS build with roles, permissions, auth/API schemas, theme constants |
| UI | `@school-erp/ui` CommonJS build with `cn` utility only |
| Database | PostgreSQL via Prisma schema and migrations |
| Deployment | Vercel projects rooted at `apps/api` and `apps/web` |

The API exposes `GET /health`, root metadata, `GET /v1/health/db`, and module routes under `/v1/*`. The frontend exposes server proxy routes under `/api/*` which forward to `/v1/*` through `apps/web/lib/api-proxy.ts`.

## Folder Inventory

Top-level folders:

- `.data` local data/backups area.
- `.git` repository metadata.
- `apps/api` Express API.
- `apps/web` Next.js frontend.
- `docs` prior phase docs and Phase 28A deliverables.
- `node_modules` installed dependencies.
- `packages/shared` shared roles, permissions, schemas, theme.
- `packages/ui` shared UI utility package.
- `prisma` schema, migrations, seed.
- `scripts` project scripts.

Important files:

- Production/deployment docs: `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_GUIDE.md`, `NEON_VERCEL_SETUP.md`, `VERCEL_DEPLOYMENT_FIX_REPORT.md`.
- Local docs: `LOCAL_DEVELOPMENT.md`, `QUICK_START.md`, `README.md`, `EXTERNAL_SERVICES.md`.
- Prisma: `prisma/schema.prisma`, `prisma/migrations/*/migration.sql`, `prisma/seed/seed.ts`.
- Backend modules: `apps/api/src/modules/*/*.routes.ts`.
- Frontend pages: `apps/web/app/(protected)/*/page.tsx`, `apps/web/app/api/*/[...path]/route.ts`.
- Frontend portals: `apps/web/components/*/*-portal.tsx`.

`AGENTS.md` was searched for but the command failed once with a thread-start error; no file appeared in the repository inventory from `rg --files`.

## Current Data Flow

1. Browser posts login to `apps/web/app/api/auth/login/route.ts`.
2. Next route validates with shared `loginSchema`.
3. Next route forwards to backend `POST /v1/auth/login`.
4. Backend validates credentials, selects an active membership, computes role permissions, creates a refresh session row, and returns access/refresh tokens.
5. Next route stores access/refresh tokens in HTTP-only cookies and stores role/name/school ID cookies for routing and display.
6. Browser calls module routes as `/api/<module>/<path>`.
7. Next proxy reads `erp_access_token`, forwards Authorization Bearer token to `${NEXT_PUBLIC_API_URL}/v1/<module>/<path>`.
8. Express verifies JWT, checks route permission, validates request body with Zod, performs Prisma operation, and returns JSON or CSV.

## Authentication Flow

Strengths:

- Passwords are checked with `bcrypt.compare`.
- Refresh tokens are random 48-byte base64url strings and stored hashed.
- Access token includes `sub`, `role`, `schoolId`, `membershipId`, and permission list.
- Login supports membership selection by `schoolId`.
- Optional TOTP path exists through `UserTwoFactorSetting`.
- Logout revokes active sessions for the user.

Risks:

- Access-token validation is stateless and does not check `Session.status`, user active state, or membership active state on each request.
- Refresh token is issued and stored but no refresh endpoint was found in inspected files.
- Login has no dedicated brute-force lockout, account throttling, or login audit trail.
- Role and name cookies are not HTTP-only; they are used for middleware routing, so UI routing can be spoofed. Server-side API permission checks mitigate API access but not UX trust.
- 2FA setup/disable routes exist in security module, but complete enrollment lifecycle and recovery codes require verification.

## Authorization Flow

Current server-side authorization exists through `authenticate` and `requirePermission`. Most modules use broad module permissions such as `ACADEMIC_MANAGE`, `FINANCE_MANAGE`, or `SCHOOL_OPERATIONS_MANAGE`.

Strengths:

- Permissions are enforced in Express middleware for API routes.
- Shared `ROLE_PERMISSIONS` drives backend JWT permissions.
- Many module routes require `schoolId` from JWT.

Risks:

- Permissions are coarse and not CRUD-specific.
- `STAFF` has broad operational access.
- `ADMISSIONS_OFFICER` is a target role but does not exist in shared permissions or Prisma enum.
- Frontend route permissions and backend permissions are not generated from the same route-policy source.
- Some portal scoping depends on names and class names rather than durable profile relationships.

## Current Deployment Flow

Preserved rules confirmed from source:

- Root `package.json` requires Node `22.x` and npm `>=10`.
- Root build order: shared, UI, Prisma generate, API, web.
- API package is CommonJS and has `main: dist/server.js`.
- Express app is default-exported from `apps/api/src/app.ts`, `apps/api/index.ts`, and `apps/api/api/index.js`.
- Backend route prefix is `/v1`.
- Health endpoint is `GET /health`.
- Frontend proxy forwards `/api/*` to `/v1/*`.
- `apps/web/next.config.ts` transpiles `@school-erp/shared` and `@school-erp/ui`.

Do not change:

- API domain `https://school-api-gules.vercel.app`.
- Web domain `https://school-com-mauve.vercel.app`.
- Vercel roots `apps/api` and `apps/web`.
- `/health`, `/v1`, and `/api` proxy behavior.
- Express default export.
- Shared package built-output requirement.

## Working Features

Working by static evidence, not full production E2E:

- API health route exists.
- DB health route exists.
- Super Admin CRUD for schools, administrators, subscriptions, users, settings, backup jobs has concrete Prisma operations.
- Generic school/module CRUD supports pagination, search, status filter, CSV export, create, delete, and patch in many modules.
- Audit logging is called for many create/update/delete/export operations.
- Frontend login posts to backend through proxy and stores cookies.
- Frontend module pages use real fetch calls, not only static rendering.

## Partial Features

- School Admin portal: real CRUD exists for academic years, classes, sections, subjects, teachers, students, fees, exams, attendance, library, timetable, but workflows are shallow records rather than complete operational processes.
- Academic, admissions, attendance, examination, LMS, finance, HR, library, communication, reports, documents, certificates, meetings, CMS, mobile, security, and production-readiness modules: route shape exists, but most are generic CRUD over simplified tables.
- Student and parent portals: real APIs exist, but profile linkage is weak and several read scopes are too broad.
- Dashboard cards show counts, but drill-down and workflow state are limited.

## Broken or Risky Features

- Runtime validation could not be completed because npm scripts failed with Node install-directory and memory errors.
- `dashboardPathFor` maps finance, librarian, and HR officer roles to `/school-admin`, while middleware maps them to `/finance`, `/library`, and `/hr`.
- Login component also maps finance, librarian, and HR officer to `/school-admin`.
- `ADMISSIONS_OFFICER` target role is missing.
- Many forms use hardcoded sample values that may not correspond to existing school data, especially `classId`.
- Student fee visibility uses `where: { schoolId }`, not student-specific invoices.
- Parent fee visibility uses `where: { schoolId }`, not child-specific invoices.
- Parent-child linkage uses `guardianName === parent.name`.
- Student profile linkage uses `studentProfile.name === user.name`.
- Some UI text contains mojibake, for example `Â·` in student profile summary.
- Several delete actions have no confirmation flow.

## Missing Features

Major missing or incomplete target capabilities:

- True multi-campus model and campus-scoped permissions.
- Fine-grained CRUD/export/approval permissions.
- Workflow engine.
- Notification delivery provider abstraction.
- Payment gateway integration and reconciliation.
- Real LMS lesson/content/submission lifecycle.
- Full SIS demographics, guardians, medical, documents, enrollment history.
- Admissions CRM pipeline and applicant portal.
- Payroll computation and payslip lifecycle.
- Library barcode/copy-level circulation.
- Report builder, scheduled reports, accessible chart summaries.
- Import/migration tooling with dry-run and rollback.
- SSO/OIDC/SAML.
- Full observability, queues, background jobs, and provider health.

## Duplicate and Obsolete Areas

- School Admin overlaps with specialized module pages for academic, attendance, finance, library, etc.
- Many portal components repeat the same `Toolbar`, `CrudPanel`, `FormPanel`, `DataTable`, `State`, `api`, `exportCsv`, and `formatValue` implementation.
- Generic table/form scaffolds appear across most portal files.
- Previous phase docs are valuable history, but their QA claims must not be treated as current production proof without rerun.

## Unsafe Features

- Super Admin backup route writes JSON snapshots to `.data/backups` and restore can upsert selected data. This is operationally sensitive and needs storage, encryption, integrity, access, and disaster recovery review.
- `SystemSetting` supports `isSecret`, but source-level inspection did not confirm encryption or redaction.
- API security middleware uses an in-memory Map rate limiter, unsuitable for serverless horizontal scaling.
- Broad `REPORTS_MANAGE` and CSV export can expose PII unless scoped and audited per report.
- Direct deletes are used in many module routes rather than soft delete or lifecycle states.

## Files That Must Be Preserved

- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/index.ts`
- `apps/api/api/index.js`
- `apps/web/lib/api-proxy.ts`
- `apps/web/app/api/auth/login/route.ts`
- `apps/web/app/api/auth/logout/route.ts`
- `apps/web/middleware.ts`
- `packages/shared/src/permissions.ts`
- `packages/shared/src/auth.ts`
- `packages/shared/src/api.ts`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `package.json`
- `package-lock.json`
- Deployment docs listed above

## Benchmark Research Sources

Official-source research was limited to public product information and patterns. PowerSchool public pages were attempted but automated access was blocked by Incapsula; no copied content was used.

- Infinite Campus SIS: https://www.infinitecampus.com/products/student-information-system
- OpenEduCat features: https://www.openeducat.org/features
- Blackbaud product/solutions site: https://www.blackbaud.com/
- PowerSchool public site: https://www.powerschool.com/

Original patterns extracted: unified SIS core, separate portals for staff/teacher/student/parent, role-based workflows, reporting/analytics as a first-class module, centralized district/platform administration, and extensible finance/communication/integration surfaces.
