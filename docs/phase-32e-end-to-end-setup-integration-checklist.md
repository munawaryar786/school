# Phase 32E End-to-End Setup Integration Checklist

Date: 2026-06-21
Branch: `phase-32-single-school-premium`
Scope: End-to-end setup readiness and connected foundation only.

## Mandatory Gate

| Requirement | Status | Notes |
| --- | --- | --- |
| Read Phase 32D-Fix checklist/report/manual QA | Completed | Stabilization scope and remaining issues reviewed. |
| Read Phase 32D checklist/report | Completed | Core setup models/routes reviewed. |
| Read Phase 32C checklist/report | Completed | Parent portal and leave flow reviewed. |
| Read Phase 32B checklist/report | Completed | Shell/dashboard/proxy conventions reviewed. |
| Inspect Prisma schema | Completed | Existing readiness models are present; no schema change planned. |
| Inspect school-admin routes | Completed | Readiness route is missing; explicit core routes exist. |
| Inspect parent routes | Completed | GuardianStudentLink-first parent scope exists. |
| Inspect school-admin portal | Completed | Dashboard uses simple metrics/status, no readiness engine. |
| Inspect parent portal | Completed | Parent child/leave routes use `/api/parent/*`. |
| Inspect frontend proxy | Completed | `/api/*` maps to backend `/v1/*`; no `/api/v1`. |
| Create this checklist before application edits | Completed | This file is the Phase 32E implementation gate. |
| Create implementation report after work | Completed | Created `docs/phase-32e-end-to-end-setup-integration-report.md`. |
| Create/update manual QA | Completed | Created `docs/phase-32e-manual-qa.md`. |

## Current Bug Audit

| Issue | Finding | Planned fix |
| --- | --- | --- |
| Parent management API can appear unavailable | Local explicit routes exist; Preview may need deployment, and frontend still only maps errors. | Keep definitive local routes and readiness refresh; document deployment refresh if Preview is old. |
| Teacher assignments can show selected resource unavailable | Backend generic/explicit routes exist; readiness engine missing and UI state does not explain dependency. | Add readiness route and connect UI dependency status to real counts. |
| Parent-child linking can fail even when student exists | Link validates parent membership and student school; if GuardianStudentLink table pending, route will fail until migration applied. | Document pending migration requirement and keep local route/schema definitive. |
| Setup cards show Setup Required after records exist | Module configs are static and dashboard does not use readiness. | Add `/v1/school-admin/readiness` and use it in dashboard/module cards. |
| Locked module dependency logic may not reflect data | Locked module text is static. | Use readiness missing dependencies and next actions per module. |

## Readiness Engine Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Add `GET /v1/school-admin/readiness` | Completed | Explicit route added before generic fallback. |
| Add frontend call `/api/school-admin/readiness` | Completed | Uses existing proxy. |
| Return school-scoped counts | Completed | Counts are school-scoped. |
| Return boolean flags | Completed | Core setup flags returned. |
| Return module status and missing dependencies | Completed | READY, SETUP_REQUIRED, DEPENDENCY_REQUIRED, COMING_LATER. |
| Connect dashboard module cards to readiness | Completed | Cards use readiness status/counts/missing dependencies. |
| Refresh readiness after create/edit/link/assignment | Completed | Successful mutations bump refresh state. |
| Preserve locked modules | Completed | Full ERP modules remain gated. |

## Validation

| Command | Status | Notes |
| --- | --- | --- |
| `npx prisma validate --schema=prisma/schema.prisma` | Completed | Passed. |
| `npx prisma generate --schema=prisma/schema.prisma` | Completed | Passed. |
| `npm run typecheck --workspace @school-erp/api` | Blocked | Local OOM after repeated 1536 MB and 1024 MB retries. |
| `npm run typecheck --workspace @school-erp/web` | Completed | Passed with 1536 MB heap. |
| `npm run test --workspace @school-erp/web` | Completed | Passed. |
| `npm run build --workspace @school-erp/shared` | Completed | Passed. |
