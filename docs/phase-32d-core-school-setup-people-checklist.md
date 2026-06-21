# Phase 32D Core School Setup And People Checklist

Date: 2026-06-21
Branch: `phase-32-single-school-premium`
Scope: Core School Setup & People Foundation only. This is not the full ERP.

Status legend: Pending, In Progress, Completed, Deferred, Blocked.

## Mandatory Gate

| Requirement | Status | Notes |
| --- | --- | --- |
| Read Phase 32 role/spec/roadmap/original differentiator docs | Completed | Reviewed before continuing implementation. |
| Read Phase 32B checklist/report | Completed | Existing shell and placeholder state confirmed. |
| Read Phase 32C checklist/report | Completed | Parent engagement and leave request state confirmed. |
| Create this checklist before application code changes | Completed | Existing checklist was present and is now updated. |
| Create implementation report after work | Completed | See `docs/phase-32d-core-school-setup-people-implementation-report.md`. |

## Academic Setup Foundation

| Requirement | Status | Notes |
| --- | --- | --- |
| Academic year list/create/update/status | Completed | Uses school-admin `academic-years` CRUD, school scoped. |
| Current academic year selection | Completed | Uses `status` active/inactive foundation. |
| Term/semester foundation if existing schema supports it | Deferred | Existing school-admin route does not expose academic terms in this pass. |
| Empty state if no academic year exists | Completed | UI state added. |

## Classes, Sections, Subjects

| Requirement | Status | Notes |
| --- | --- | --- |
| Class list/create/edit/status | Completed | School-scoped `ClassLevel`. |
| Section list/create/edit/class link/capacity | Completed | Class ownership validated before create/update. |
| Subject list/create/edit/status | Completed | School-scoped `Subject`. |
| Subject-class link | Deferred | Existing schema does not model direct class-subject links; teacher assignment links subject to class. |

## Students, Teachers, Parents

| Requirement | Status | Notes |
| --- | --- | --- |
| Student list/create/edit/basic class assignment | Completed | Existing schema supports `className`, not section id. |
| Teacher list/create/edit | Completed | Existing `TeacherProfile`; no direct User relation in this schema. |
| Teacher class/section/subject assignment foundation | Completed | Added `TeacherSubjectAssignment` model, routes, and UI. |
| Parent/guardian list/create | Completed | Creates/reuses parent user membership safely. |
| Parent-child linking | Completed | Added `GuardianStudentLink` model, route, and UI. |
| Relation type/emergency contact/login status | Completed | Supported by schema/routes/UI. |
| Parent portal link-model compatibility | Completed | Parent portal reads verified links first and falls back to guardianName matching. |

## School Admin UI

| Requirement | Status | Notes |
| --- | --- | --- |
| Open Academic Setup, Classes, Sections, Subjects, Students, Teachers, Parents | Completed | Replaced Phase 32B placeholder button for these workflows. |
| Loading/error/empty/retry/form validation states | Completed | Added reusable resource workspace. |
| Keep Attendance, Timetable, Exams, Fees, Library, Reading Program, LMS locked | Completed | Dependency-aware placeholder messaging retained. |
| No fake rows/static demo counts | Completed | UI reads live API only. |

## Backend/API/Security

| Requirement | Status | Notes |
| --- | --- | --- |
| Preserve backend `/v1` and frontend `/api` proxy | Completed | Existing routing untouched. |
| Required school-admin CRUD routes | Completed | Existing generic routes reused for core resources; explicit parent/link/login and teacher assignment routes added. |
| School-admin permission required | Completed | `SCHOOL_OPERATIONS_MANAGE` remains required. |
| Every query scoped by `req.auth.schoolId` | Completed | CRUD, parent links, and assignments use school scope. |
| Prevent cross-school parent/student/class/section/subject/teacher access | Completed | Reference ownership checks added. |
| Clear validation/safe 404/403 | Completed | Zod validation and scoped lookups used. |

## Data Model And Migration

| Requirement | Status | Notes |
| --- | --- | --- |
| Inspect and reuse existing Prisma models | Completed | Reused core setup/person models. |
| Add minimal migration if required | Completed | Added `20260621120000_phase_32d_core_people_foundation`. |
| Do not apply migration | Completed | Migration was not applied. |

## Validation

| Requirement | Status | Notes |
| --- | --- | --- |
| `npx prisma validate --schema=prisma/schema.prisma` | Completed | Passed via `npx.cmd`. |
| `npx prisma generate --schema=prisma/schema.prisma` | Completed | Passed via `npx.cmd`. |
| `npm run typecheck --workspace @school-erp/api` | Completed | Passed. |
| `npm run typecheck --workspace @school-erp/web` | Completed | Passed with `NODE_OPTIONS=--max-old-space-size=1536`. |
| `npm run test --workspace @school-erp/web` | Completed | Passed. |
| `npm run build --workspace @school-erp/shared` | Completed | Passed. |
| `npx prisma migrate status --schema=prisma/schema.prisma` | Blocked | Connected to Neon but DB user lacks `_prisma_migrations` permission. |
