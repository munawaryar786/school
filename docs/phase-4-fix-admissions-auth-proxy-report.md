# Phase 4-Fix Admissions Authentication And Proxy Flow Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

This fix only addressed Admissions authentication/proxy behavior in the School Admin portal. Phase 5 and locked modules were not started.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/web/app/api/school-admin/[...path]/route.ts`
- `apps/web/lib/api-proxy.ts`
- `apps/web/lib/api-routing.ts`
- `apps/web/lib/auth.ts`
- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.core-setup.routes.ts`
- `apps/api/src/app.ts`

## Root Cause

Admissions frontend calls were already using `/api/school-admin/admissions`, and the School Admin proxy correctly maps that path to `/v1/school-admin/admissions`. Backend admissions routes are registered before the generic `/:resource` fallback and use the same School Admin middleware as other School Admin routes.

The remaining local hardening gap was the browser request helper: it relied on default same-origin fetch credential behavior and cache behavior. To remove ambiguity for Admissions and every School Admin resource, the helper now explicitly uses `credentials: "same-origin"` and `cache: "no-store"`.

The live Preview can still show the old route/auth errors if the latest web/API deployment is not refreshed, but local code now definitively uses the authenticated `/api` proxy flow.

## Admissions URL/Path Result

Admissions now uses:

- `GET /api/school-admin/admissions`
- `POST /api/school-admin/admissions`
- `PATCH /api/school-admin/admissions/:id`
- `PATCH /api/school-admin/admissions/:id/status`
- `POST /api/school-admin/admissions/:id/convert-to-student`

Proxy target remains:

- `/v1/school-admin/admissions`
- `/v1/school-admin/admissions/:id`
- `/v1/school-admin/admissions/:id/status`
- `/v1/school-admin/admissions/:id/convert-to-student`

No direct browser `/v1` calls and no hardcoded API origin were added.

## Changes Made

- Updated the shared School Admin `api()` helper in `school-admin-portal.tsx`.
- Added explicit `credentials: "same-origin"`.
- Added `cache: "no-store"`.
- Preserved request headers while allowing caller-provided headers to merge safely.
- Added friendly auth message: `Please log in again to continue.`
- Added Admissions-specific route/deployment message: `Admissions API is unavailable. Retry after deployment.`

## Backend Changes

No backend changes were required in this fix. The backend route audit confirmed:

- `router.use(authenticate, requirePermission(PERMISSIONS.SCHOOL_OPERATIONS_MANAGE))`
- Admissions routes exist before `/:resource`
- Core setup router mounted before School Admin routes has no catch-all and does not swallow Admissions paths

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Migration Status

No schema changes were made. No migration was created or applied.

## Browser QA Status

Not run because `npm run dev` and deployment were explicitly disallowed. Manual QA is documented separately.

## Unverified Items

- Preview must be redeployed before confirming the live Admissions page no longer uses stale web/API code.
- Browser QA should confirm the auth cookie is present and `/api/school-admin/admissions` returns data while logged in.

## Safe To Commit

Yes, after Project Owner review. Do not push or deploy without approval.
