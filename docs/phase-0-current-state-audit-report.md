# Phase 0 Current State Audit And Release Sync Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Scope

Phase 0 is audit-only. No application behavior was changed. No migration was applied. No push, merge, deploy, dev server, or implementation work was started.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- Phase 32B, 32C, 32D, 32D-Fix, 32E, and 32E-Fix reports
- Git branch and working tree status
- Prisma migration folders and Phase 32C/32D migration SQL
- Prisma schema model presence for Phase 32C/32D models
- Backend route mounts in `apps/api/src/app.ts`
- School Admin routes in `apps/api/src/modules/school-admin/school-admin.routes.ts`
- Parent routes in `apps/api/src/modules/parent/parent.routes.ts`
- Frontend School Admin calls in `apps/web/components/school-admin/school-admin-portal.tsx`
- Frontend Parent Portal calls in `apps/web/components/parent/parent-portal.tsx`
- Frontend proxy files under `apps/web/app/api`
- Proxy URL builder in `apps/web/lib/api-routing.ts`
- Local `.env` shape without exposing secret values

## Current Git Status

Current branch:

- `phase-32-single-school-premium`

Current status:

```text
?? docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md
?? docs/phase-0-current-state-audit-checklist.md
?? docs/phase-0-current-state-audit-report.md
```

## Modified Tracked Files

None.

## Untracked Files

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-0-current-state-audit-checklist.md`
- `docs/phase-0-current-state-audit-report.md`

## Migration Files

Phase 32C migration:

- `prisma/migrations/20260620130000_phase_32c_parent_leave_requests/migration.sql`

Adds:

- `LeaveRequestType`
- `LeaveRequestStatus`
- `LeaveRequest`
- `LeaveRequestTimeline`

Phase 32D migration:

- `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`

Adds:

- `GuardianRelationType`
- `GuardianStudentLink`
- `TeacherSubjectAssignment`

Schema contains the related Phase 32C and Phase 32D models/enums.

## Migration Status

`npx.cmd prisma migrate status --schema=prisma/schema.prisma` was run as a read-only audit command.

Result:

- Sandboxed run failed with Prisma schema engine error.
- Elevated read-only retry connected to Neon but failed with:
  `ERROR: permission denied for table _prisma_migrations`

Conclusion:

- Repo contains Phase 32C and Phase 32D migrations.
- Actual database applied state cannot be confirmed with the current configured database user because it cannot read `_prisma_migrations`.
- Existing phase/user context says Phase 32C was applied successfully.
- Phase 32D remains the required migration for parent-child links and teacher assignments in the target database unless an authorized migration status check proves it is already applied.

## Phase 32D Migration Safety

BOM check:

- `NO_BOM`

Unsafe SQL check:

- No `DROP`
- No `TRUNCATE`
- No `DELETE FROM`
- `ALTER TABLE` appears only for foreign-key constraints on newly created Phase 32D tables.

Assessment:

- The Phase 32D migration SQL is narrow and expected for the feature.
- It must still be reviewed and applied only by Project Owner approval using a direct Neon migration URL, not the pooled runtime URL.

## Environment Shape

Local `.env` has `DATABASE_URL`.

Observed without printing secrets:

- Starts with PostgreSQL URL: yes
- Contains `-pooler`: yes
- Contains `sslmode=require`: yes

Assessment:

- This is consistent with a runtime pooled Neon URL.
- Migration apply should use a direct non-pooler Neon URL per Master Book.

## Latest Local Route Code

Local route code exists for all audited endpoints.

School Admin route mounting:

- `apps/api/src/app.ts` mounts `schoolAdminRoutes` at `/v1/school-admin`.

Parent route mounting:

- `apps/api/src/app.ts` mounts `parentRoutes` at `/v1/parent`.

Route order:

- Explicit School Admin CRUD routes and explicit parents/readiness/leave routes are declared before generic `/:resource` catch-all routes.
- Generic catch-all starts later at `router.get("/:resource")`, `router.post("/:resource")`, `router.patch("/:resource/:id")`, and `router.delete("/:resource/:id")`.

## Backend Route Matrix

| Workflow | Frontend path | Proxy target | Backend route | Handler file | Method | Expected DB table/model |
| --- | --- | --- | --- | --- | --- | --- |
| Readiness | `/api/school-admin/readiness` | `/v1/school-admin/readiness` | `/v1/school-admin/readiness` | `apps/api/src/modules/school-admin/school-admin.routes.ts` + `school-admin.readiness.ts` | GET | `AcademicYear`, `ClassLevel`, `Section`, `Subject`, `StudentProfile`, `TeacherProfile`, `SchoolMembership`, `GuardianStudentLink`, `TeacherSubjectAssignment`, plus existing module counts |
| Parents list | `/api/school-admin/parents` | `/v1/school-admin/parents` | `/v1/school-admin/parents` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | `SchoolMembership`, `User`, optional `GuardianStudentLink` |
| Parent create | `/api/school-admin/parents` | `/v1/school-admin/parents` | `/v1/school-admin/parents` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | POST | `User`, `SchoolMembership`, optional `GuardianStudentLink` |
| Parent edit | `/api/school-admin/parents/:parentId` | `/v1/school-admin/parents/:parentId` | `/v1/school-admin/parents/:parentId` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | PATCH | `User`, `SchoolMembership`, optional `GuardianStudentLink` |
| Parent-child link | `/api/school-admin/parents/:parentId/link-child` | `/v1/school-admin/parents/:parentId/link-child` | `/v1/school-admin/parents/:parentId/link-child` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | POST | `GuardianStudentLink`, `SchoolMembership`, `StudentProfile` |
| Parent login status | `/api/school-admin/parents/:parentId/login-status` | `/v1/school-admin/parents/:parentId/login-status` | `/v1/school-admin/parents/:parentId/login-status` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | PATCH | `User`, `SchoolMembership`, `GuardianStudentLink` |
| Teacher assignments list | `/api/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | `TeacherSubjectAssignment` |
| Teacher assignment create | `/api/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | POST | `TeacherSubjectAssignment`, `TeacherProfile`, `ClassLevel`, `Section`, `Subject` |
| Teacher assignment edit | `/api/school-admin/teacher-assignments/:id` | `/v1/school-admin/teacher-assignments/:id` | `/v1/school-admin/teacher-assignments/:id` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | PATCH | `TeacherSubjectAssignment`, `TeacherProfile`, `ClassLevel`, `Section`, `Subject` |
| School Admin leave queue | `/api/school-admin/leave-requests` | `/v1/school-admin/leave-requests` | `/v1/school-admin/leave-requests` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | `LeaveRequest`, `LeaveRequestTimeline`, `StudentProfile`, `User` |
| School Admin leave review | `/api/school-admin/leave-requests/:id/review` | `/v1/school-admin/leave-requests/:id/review` | `/v1/school-admin/leave-requests/:id/review` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | PATCH | `LeaveRequest`, `LeaveRequestTimeline` |
| Parent children | `/api/parent/children` | `/v1/parent/children` | `/v1/parent/children` | `apps/api/src/modules/parent/parent.routes.ts` | GET | `GuardianStudentLink`, fallback `StudentProfile` guardian match |
| Parent child summary | `/api/parent/children/:studentId/summary` | `/v1/parent/children/:studentId/summary` | `/v1/parent/children/:studentId/summary` | `apps/api/src/modules/parent/parent.routes.ts` | GET | `StudentProfile`, `TeacherAttendance`, `TeacherMark`, `TeacherAssignment`, `FeeRecord`, `ParentFeePayment`, `ParentCommunication`, `ParentPortalMessage`, `LeaveRequest` |
| Parent leave list | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | `apps/api/src/modules/parent/parent.routes.ts` | GET | `LeaveRequest`, `LeaveRequestTimeline` |
| Parent leave submit | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | `apps/api/src/modules/parent/parent.routes.ts` | POST | `LeaveRequest`, `LeaveRequestTimeline` |

## Proxy Behavior

School Admin proxy:

- File: `apps/web/app/api/school-admin/[...path]/route.ts`
- Supports GET, POST, PATCH, DELETE.
- Calls `proxyApiRoute(request, context, "school-admin")`.

Parent proxy:

- File: `apps/web/app/api/parent/[...path]/route.ts`
- Supports GET, POST, PATCH, DELETE.
- Calls `proxyApiRoute(request, context, "parent")`.

Shared proxy:

- File: `apps/web/lib/api-proxy.ts`
- Reads `erp_access_token` cookie.
- Forwards bearer token to backend.
- Preserves request method and body.
- Uses `backendModuleUrl(modulePath, path, search)`.

URL builder:

- File: `apps/web/lib/api-routing.ts`
- `backendModuleUrl("school-admin", ["parents"], search)` becomes `/v1/school-admin/parents`.
- `backendModuleUrl("parent", ["children"], search)` becomes `/v1/parent/children`.
- No `/api/v1` restoration exists in these paths.

## Frontend Call Audit

School Admin component:

- File: `apps/web/components/school-admin/school-admin-portal.tsx`
- Uses `fetch("/api/school-admin/${path}")`.
- Calls:
  - `dashboard`
  - `readiness`
  - `academic-years`
  - `classes`
  - `sections`
  - `subjects`
  - `students`
  - `teachers`
  - `parents`
  - `parents/:parentId/link-child`
  - `parents/:parentId/login-status`
  - `teacher-assignments`
  - `leave-requests`
  - `leave-requests/:id/review`

Parent portal component:

- File: `apps/web/components/parent/parent-portal.tsx`
- Uses `fetch("/api/parent/${path}")`.
- Calls:
  - `children`
  - `children/:studentId/summary`
  - `children/:studentId/leave-requests` GET
  - `children/:studentId/leave-requests` POST

## Likely Cause Of Current Preview Errors

### Parent portal: `Route not found`

Most likely causes:

1. Old API deployment does not include Phase 32C/32E parent routes.
2. Web preview is pointed at an API deployment/environment that is not synced with this branch.
3. If the route exists but the DB lacks Phase 32C tables, leave request calls may fail differently after reaching the route.

Local route mismatch:

- Not likely. Local `/v1/parent/children` and `/v1/parent/children/:studentId/leave-requests` routes exist.

Frontend proxy issue:

- Not likely locally. `/api/parent/...` forwards to `/v1/parent/...`.

Auth/permission issue:

- Possible only after route is reached. A permission failure should return auth/permission errors, not raw `Route not found`.

### School Admin Parents: `Parent management API is unavailable. Retry after deployment.`

Most likely causes:

1. Old API deployment lacks local explicit `/v1/school-admin/parents` routes.
2. Web and API previews are out of sync.
3. Phase 32D migration is missing, and calls involving guardian links hit missing `GuardianStudentLink` table.

Local route mismatch:

- Not likely. Local `/v1/school-admin/parents` GET/POST/PATCH routes exist before catch-all.

DB table missing:

- Possible. Parent list has fallback if `GuardianStudentLink` is missing, but create/link/login status workflows depend on the Phase 32D table.

### Parent-child linking: `This child could not be linked. Confirm the student and parent belong to this school.`

Most likely causes:

1. Phase 32D migration missing in target DB, so `GuardianStudentLink` table does not exist.
2. Parent or student belongs to a different school.
3. Old API deployment lacks the explicit link route.
4. Auth token belongs to a user without the expected school admin permission/school scope.

Local route mismatch:

- Not likely. Local `/v1/school-admin/parents/:parentId/link-child` exists.

### Role portals show preview counts but may not be fully connected

Most likely cause:

- Several role portals were intentionally foundation/preview states from Phase 32B and later phases. Phase 0 should not add features. Full connectivity belongs to later roadmap phases.

## Browser Error Cause Classification

| Cause | Assessment |
| --- | --- |
| Old deployment | Likely. Local routes exist while Preview still shows route errors. |
| Missing migration | Likely for parent-child linking and teacher assignments because Phase 32D creates `GuardianStudentLink` and `TeacherSubjectAssignment`. |
| Route mismatch | Not likely locally for audited routes. Paths match `/api/...` -> `/v1/...`. |
| Frontend proxy issue | Not likely locally. Catch-all proxy preserves module path and maps to `/v1`. |
| Auth/permission issue | Possible if user token lacks `SCHOOL_OPERATIONS_MANAGE` or `PARENT_PORTAL_ACCESS`, but this would not be the first explanation for raw route-not-found symptoms. |
| DB table missing | Likely for Phase 32D-specific workflows if migration is not applied. Possible for Phase 32C leave flow if target DB does not actually have Phase 32C tables. |

## Exact Reason Preview Likely Still Shows Parent Route Errors

The local code contains the required parent and school-admin routes, and the frontend proxy maps the expected `/api` paths to `/v1` backend paths. Therefore, current Preview route errors are most likely caused by deployment/database state, not local route definitions:

1. The deployed API is probably older than the local Phase 32D-Fix/32E route code, or the deployed web points to an older API URL.
2. The target DB likely still needs the Phase 32D migration for `GuardianStudentLink` and `TeacherSubjectAssignment`.
3. Current DB credentials cannot confirm `_prisma_migrations`, so applied migration state must be checked with an authorized direct Neon migration URL/user.

## Exact Next Commands For Project Owner

Do not run these until Project Owner approves the next step.

1. Commit current docs-only audit if accepted:

```powershell
git status
git add docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md docs/phase-0-current-state-audit-checklist.md docs/phase-0-current-state-audit-report.md
git commit -m "docs: add locked master book and phase 0 audit"
```

2. With a direct non-pooler Neon migration URL, check migration status:

```powershell
$env:DATABASE_URL="<NEON_DIRECT_NON_POOLER_URL_WITH_SSLMODE_REQUIRE>"
npx.cmd prisma migrate status --schema=prisma/schema.prisma
```

3. If status shows pending migrations and Project Owner approves applying them:

```powershell
$env:DATABASE_URL="<NEON_DIRECT_NON_POOLER_URL_WITH_SSLMODE_REQUIRE>"
npx.cmd prisma migrate deploy --schema=prisma/schema.prisma
```

4. After migration is confirmed, redeploy/sync API and web previews from this branch.

5. Browser QA after redeploy:

```text
/school-admin
/parent
School Admin Parents
Parent-child linking
Teacher assignments
Parent linked child visibility
Parent leave request
School Admin leave review
```

## Safety Decisions

Safe to commit:

- Yes, for docs-only Phase 0 audit files.

Safe to push:

- Technically safe after review/commit, but do not push without explicit Project Owner instruction.

Safe to deploy:

- Not yet. Deployment should wait until migration status and release sync plan are confirmed.

Safe to apply Phase 32D migration:

- SQL appears safe and required for browser QA, but do not apply until Project Owner explicitly approves and a direct non-pooler Neon migration URL/user is available.

## What Was Changed

Docs only:

- Created `docs/phase-0-current-state-audit-checklist.md`
- Created `docs/phase-0-current-state-audit-report.md`

No application behavior changed.

## Routes Added Or Changed

None in Phase 0.

## Frontend Files Changed

None.

## Backend Files Changed

None.

## Schema Or Migration Changes

None.

## Permissions And Security Notes

- Audited local School Admin routes require `SCHOOL_OPERATIONS_MANAGE`.
- Audited local Parent routes require `PARENT_PORTAL_ACCESS`.
- Audited route logic uses `req.auth.schoolId` scoping.
- Parent-child linking validates parent membership and student ownership by school.
- Teacher assignment validation checks teacher, class, section, and subject ownership by school.

## Validation Results

No build/typecheck/test validation was run because Phase 0 was audit/docs-only and no application behavior changed.

Audit command result:

- `npx.cmd prisma migrate status --schema=prisma/schema.prisma`: blocked by `_prisma_migrations` permission after connecting to Neon.

## Browser QA Status

Not run. No dev server was started and no Preview deployment was changed.

## Unverified Items

- Actual target DB applied migration list cannot be confirmed with current DB permissions.
- Preview deployment freshness cannot be confirmed locally.
- Browser QA must wait until Phase 32D migration status/apply and API/web redeploy are handled.

## Files Changed

- `docs/phase-0-current-state-audit-checklist.md`
- `docs/phase-0-current-state-audit-report.md`

Existing untracked docs from previous instruction:

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`

## Git Status

```text
?? docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md
?? docs/phase-0-current-state-audit-checklist.md
?? docs/phase-0-current-state-audit-report.md
```

## Recommended Next Phase

Phase 1 — Migration And Deployment Readiness.

Do not start Phase 1 until Project Owner confirms.
