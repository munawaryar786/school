# Phase 32C Parent Engagement Checklist

Date: 2026-06-20
Branch: `phase-32-single-school-premium`
Scope: Parent Engagement Foundation and first real premium parent workflow. This is not the full ERP.

Status legend: Pending, In Progress, Completed, Deferred, Blocked.

## Mandatory Gate

| Requirement | Status | Notes |
| --- | --- | --- |
| Read `docs/phase-32-ui-reference-analysis.md` | Completed | Phase 32 product/UI direction reviewed in prior Phase 32 work and referenced for this pass. |
| Read `docs/phase-32-advanced-market-feature-research.md` | Completed | Existing Phase 32 research direction reviewed before implementation planning. |
| Read `docs/phase-32-role-feature-matrix.md` | Completed | Parent/leave permissions and linked-child rules reviewed. |
| Read `docs/phase-32-parent-student-engagement-spec.md` | Completed | Parent child selector, leave workflow, summaries, and privacy rules reviewed. |
| Read `docs/phase-32-library-reading-program-spec.md` | Completed | Reading/library request direction considered as preview only. |
| Read `docs/phase-32-premium-erp-module-roadmap.md` | Completed | Phase 32C boundaries reviewed. |
| Read `docs/phase-32-original-premium-differentiators.md` | Completed | Parent leave/half-day and attention-card differentiators reviewed. |
| Read `docs/phase-32b-premium-school-shell-checklist.md` | Completed | Phase 32B shell constraints reviewed. |
| Read `docs/phase-32b-implementation-report.md` | Completed | Existing parent dashboard foundation and route usage reviewed. |
| Create this checklist before application code changes | Completed | This file is the implementation gate. |
| Create implementation report after work | Completed | Created `docs/phase-32c-parent-engagement-implementation-report.md`. |

## Phase 32C Scope

| Requirement | Status | Notes |
| --- | --- | --- |
| Parent dashboard child overview foundation | Completed | Uses `/v1/parent/children` and selected child summary. |
| Parent What Needs My Attention card | Completed | Uses leave, fees, homework, results, and messages from backend data only. |
| Parent leave / half-day request foundation | Completed | Parent can submit leave/half-day request for linked child only. |
| Leave request review foundation for School Admin/Teacher if practical | Deferred | School Admin review implemented; teacher review deferred until safe teacher-student scoping exists. |
| Parent leave request timeline UI | Completed | Timeline renders persisted `LeaveRequestTimeline` events. |
| Safe backend data model/API if required | Completed | Added `LeaveRequest` and `LeaveRequestTimeline` with school/student/parent scoping. |
| Parent dashboard smart empty states | Completed | Includes linked-child, attention, leave list, loading, and error states. |
| Parent notices/homework/results/fees/library summary cards | Completed | Cards use existing real counts or setup/empty state. |
| Parent library/reading request preview only | Completed | Shows setup state only; no fake reading data. |
| Parent sees linked children only | Completed | Server-side linked-child guard on list/create/summary routes. |

## Explicit Non-Scope

| Requirement | Status | Notes |
| --- | --- | --- |
| Do not implement full attendance marking workflow | Completed | Not implemented. Leave does not mutate attendance. |
| Do not implement full timetable builder | Completed | Not implemented. |
| Do not implement full library circulation | Completed | Not implemented. |
| Do not implement reading badges/challenges | Completed | Not implemented. |
| Do not implement full fees/payment workflow | Completed | Not implemented. |
| Do not implement full exams/results workflow | Completed | Not implemented. |
| Do not implement full LMS workflow | Completed | Not implemented. |
| Do not implement reports export | Completed | Not implemented. |
| Do not implement notification provider | Completed | Not implemented. |
| Do not implement AI/risk scoring | Completed | Not implemented. |

## Parent Dashboard Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Header says Parent Engagement Hub | Completed | Implemented. |
| No tenant/SaaS wording in Parent portal | Completed | Parent UI uses school/child language. |
| Linked Children section | Completed | Uses backend child profiles. |
| Child card: student name | Completed | Real child name is rendered from backend child profile. |
| Child card: class/section if available | Completed | Renders `className`; separate section field is unavailable in current `StudentProfile`. |
| Child card: admission number if available | Completed | Renders `admissionNumber` when present. |
| Child card: attendance summary if available | Completed | Attendance summary card uses real child summary endpoint data. |
| Child card: fee status if available | Completed | Fee summary card uses real child summary endpoint data. |
| Child card: library due status if available | Deferred | Library due model is not available; UI shows setup/empty state only. |
| No linked child exact empty message | Completed | Exact message implemented. |
| Attention card uses real data only | Completed | Uses backed leave/fee/homework/result/message data only. |
| No attention items exact empty message | Completed | Exact message implemented. |
| Summary cards: Attendance | Completed | Real count/empty from child summary endpoint. |
| Summary cards: Leave Requests | Completed | Real leave count/status from `LeaveRequest`. |
| Summary cards: Homework/Assignments | Completed | Uses existing `TeacherAssignment` count. |
| Summary cards: Exam Results | Completed | Uses existing `TeacherMark` count/summary. |
| Summary cards: Fees | Completed | Uses existing fee/payment count data. |
| Summary cards: Notices | Completed | Uses existing communication count; otherwise empty state. |
| Summary cards: Teacher Messages | Completed | Uses existing parent communication/message data. |
| Summary cards: Library / Reading | Deferred | Full reading/library due workflow deferred; setup/empty state only. |

## Leave / Half-Day Workflow

| Requirement | Status | Notes |
| --- | --- | --- |
| Parent selects linked child | Completed | Child selector implemented; server validates linked child. |
| Request types include all required types | Completed | All required types implemented in schema/API/UI. |
| Parent selects start date | Completed | Required in UI and API schema. |
| Parent selects end date | Completed | Required and validated with date range refinement. |
| Parent selects start time if applicable | Completed | Optional field implemented. |
| Parent selects end time if applicable | Completed | Optional field implemented. |
| Parent enters reason | Completed | Required in UI and API schema. |
| Parent enters optional note | Completed | Optional note implemented. |
| Parent submits request | Completed | POST route and UI submit implemented. |
| Parent sees status values | Completed | Status badges render persisted leave statuses. |
| Parent sees timeline submitted event | Completed | Submit creates real `LeaveRequestTimeline` event. |
| Parent sees reviewer action/comment if any | Completed | Reviewer comment/action render from review fields/timeline. |
| School Admin can view leave request queue | Completed | School-scoped review queue implemented. |
| School Admin can approve/reject/comment if implemented | Completed | Approve/reject/comment/clarification/under-review implemented. |
| Teacher leave context if practical | Deferred | Deferred because safe teacher-student scoping needs later academic setup. |
| No fake leave requests | Completed | Database only. |

## Backend/API Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Preserve backend `/v1` prefix | Completed | Preserved. |
| Preserve frontend `/api` proxy prefix | Completed | Preserved. |
| Parent GET `/v1/parent/children` or existing convention equivalent | Completed | Implemented existing singular `/v1/parent/children`. |
| Parent GET child summary route | Completed | Implemented `/v1/parent/children/:studentId/summary`. |
| Parent GET child leave requests route | Completed | Enforces linked child and requestedById. |
| Parent POST child leave requests route | Completed | Enforces linked child. |
| School Admin GET leave request queue route | Completed | Enforces school scope. |
| School Admin PATCH review route | Completed | Enforces school scope and review status guard. |
| API responses use existing envelope style | Completed | Uses existing envelope style. |

## Data Model Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Add minimal LeaveRequest model if missing | Completed | Added. |
| Add LeaveRequestTimeline if practical | Completed | Added. |
| Include schoolId | Completed | Added. |
| Include studentId | Completed | Added. |
| Include requestedById | Completed | Added. |
| Include type/status/date/time/reason/note | Completed | Added. |
| Include reviewer fields | Completed | Added reviewerId/comment/reviewedAt. |
| Include createdAt/updatedAt | Completed | Added. |
| Create safe migration if schema changes | Completed | Added migration SQL; no reset/db push. |
| Document migration name/status | Completed | Documented in implementation report. |

## UI Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Parent dashboard attention card | Completed | Uses real backed data only. |
| Child selector/card | Completed | Uses linked child data only. |
| Leave request form | Completed | Implemented with labels, required fields, and submit state. |
| Leave request list | Completed | Uses real backend requests only. |
| Leave request timeline | Completed | Uses real timeline events. |
| Status badges | Completed | Implemented for parent and school-admin leave states. |
| Empty states | Completed | Implemented for no child, no attention, no leave requests, and no review queue. |
| Error states | Completed | Implemented with retry where applicable. |
| Loading states | Completed | Implemented for parent and review queue fetches. |
| Retry actions | Completed | Refresh/retry actions implemented. |
| School Admin review UI | Completed | Queue card implemented in School Admin dashboard. |
| Status filter | Deferred | Backend supports status query; UI filter control deferred to later refinement. |
| Approve/reject/comment action | Completed | Implemented. |

## Validation And Safety

| Requirement | Status | Notes |
| --- | --- | --- |
| Parent cannot submit leave for unrelated child | Completed | `ensureLinkedChild` server-side guard. |
| Parent cannot list unrelated child leave requests | Completed | `ensureLinkedChild` plus `requestedById` filter. |
| School Admin cannot see other school leave requests | Completed | Queries scoped by `req.auth.schoolId`. |
| Invalid child id returns 403/404 safely | Completed | Invalid linked child returns 403 `fail` envelope. |
| Invalid date range returns 400 | Completed | Zod refine enforces end date after start date. |
| Missing reason returns validation error | Completed | Zod requires reason. |
| Invalid status transition returns validation error | Completed | Review schema and active-state guard implemented. |
| UI never crashes on empty data | Completed | Arrays/data are defaulted and empty states render. |

## Validation Commands

| Requirement | Status | Notes |
| --- | --- | --- |
| `npm run typecheck --workspace @school-erp/web` | Completed | Passed. |
| `npm run test --workspace @school-erp/web` | Completed | Passed. |
| `npm run build --workspace @school-erp/shared` | Completed | Passed. |
| `npm run typecheck --workspace @school-erp/api` if backend/schema changed | Completed | Passed. |
| `npx prisma validate` if schema changed | Completed | Passed. |
| `npx prisma migrate status --schema=prisma/schema.prisma` if schema changed | Blocked | DB user lacks `_prisma_migrations` permission; migration not applied. |
