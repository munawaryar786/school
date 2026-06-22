# Phase 5-Fix API Route Deployment Sync And Attendance/Admissions Route Audit Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Audited the route/proxy/deployment path for Admissions, Teacher Attendance, and School Admin Attendance. No Phase 6 work was started. No migrations, deployment, push, merge, dev server, `npm install`, `db push`, or migration reset were run.

## Root Cause

The local application code has the required routes and proxy forwarding. The current live browser errors are therefore most likely caused by deployment sync, not by a local route definition or frontend path bug:

- `School Admin -> Admissions`: the frontend maps backend route-not-found errors to `Admissions API is unavailable. Retry after deployment.`
- `Teacher -> Attendance Marking`: the frontend receives `Route not found` for `/api/teacher/attendance/...`.

Because teacher assignment data is visible in the deployed teacher dashboard, authentication and teacher assignment data are partially working. The failing routes are the newer admissions and attendance endpoints, which points to the deployed API not containing the latest route code or the deployed web project pointing to an older API preview origin.

## Route Matrix

| Browser path | Proxy target | Backend route | Handler file | Method | Local status |
| --- | --- | --- | --- | --- | --- |
| `/api/school-admin/admissions` | `/v1/school-admin/admissions` | `router.get("/admissions")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | Present before catch-all |
| `/api/school-admin/admissions` | `/v1/school-admin/admissions` | `router.post("/admissions")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | POST | Present before catch-all |
| `/api/school-admin/admissions/:id/status` | `/v1/school-admin/admissions/:id/status` | `router.patch("/admissions/:id/status")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | PATCH | Present before catch-all |
| `/api/school-admin/admissions/:id/convert-to-student` | `/v1/school-admin/admissions/:id/convert-to-student` | `router.post("/admissions/:id/convert-to-student")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | POST | Present before catch-all |
| `/api/teacher/attendance/context` | `/v1/teacher/attendance/context` | `router.get("/attendance/context")` | `apps/api/src/modules/teacher/teacher.routes.ts` | GET | Present before catch-all |
| `/api/teacher/attendance/students` | `/v1/teacher/attendance/students` | `router.get("/attendance/students")` | `apps/api/src/modules/teacher/teacher.routes.ts` | GET | Present before catch-all |
| `/api/teacher/attendance/mark` | `/v1/teacher/attendance/mark` | `router.post("/attendance/mark")` | `apps/api/src/modules/teacher/teacher.routes.ts` | POST | Present before catch-all |
| `/api/school-admin/attendance` | `/v1/school-admin/attendance` | `router.get("/attendance")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | Present before catch-all |
| `/api/school-admin/attendance/summary` | `/v1/school-admin/attendance/summary` | `router.get("/attendance/summary")` | `apps/api/src/modules/school-admin/school-admin.routes.ts` | GET | Present before catch-all |

## Backend Audit

- `apps/api/src/app.ts` mounts `schoolAdminCoreSetupRoutes`, then `schoolAdminRoutes`, at `/v1/school-admin`.
- `apps/api/src/app.ts` mounts `teacherRoutes` at `/v1/teacher`.
- School Admin admissions routes are declared before the generic `/:resource` routes.
- School Admin attendance routes are declared before the generic `/:resource` routes.
- Teacher attendance routes are declared before the generic `/:resource` route.
- No backend route prefix change was made.

## Frontend Proxy Audit

- `apps/web/app/api/school-admin/[...path]/route.ts` forwards all supported methods through `proxyApiRoute(..., "school-admin")`.
- `apps/web/app/api/teacher/[...path]/route.ts` forwards all supported methods through `proxyApiRoute(..., "teacher")`.
- `apps/web/lib/api-proxy.ts` forwards the `erp_access_token` cookie as a Bearer token.
- `apps/web/lib/api-routing.ts` maps frontend proxy paths to backend `/v1/{module}/{path}`.
- No frontend proxy prefix change was made.

## Frontend Call Audit

- Admissions use the shared School Admin request helper, which calls `/api/school-admin/{path}` with `credentials: "same-origin"` and `cache: "no-store"`.
- School Admin attendance uses `/api/school-admin/attendance` and `/api/school-admin/attendance/summary`.
- Teacher attendance uses `/api/teacher/attendance/context`, `/api/teacher/attendance/students`, and `/api/teacher/attendance/mark`.
- No browser call to direct `/v1` or direct `NEXT_PUBLIC_API_URL` was found in the audited components.

## Fix Applied

No application code change was required. The actual fix is release synchronization:

1. Deploy the API project containing these route definitions first.
2. Deploy the web project second.
3. Confirm `school-com` `NEXT_PUBLIC_API_URL` points to the latest `school-api` preview origin.
4. Confirm the API origin has no trailing slash and does not include `/api` or `/v1`.
5. Re-test the browser flows after both deployments finish.

## Deployment Readiness Notes

- If the live API still returns `Route not found` after API redeploy, inspect whether Vercel deployed the correct branch and latest commit.
- If the web still shows admissions unavailable after API redeploy, inspect `NEXT_PUBLIC_API_URL` on the web deployment.
- If admissions or attendance return model/table errors after route availability is fixed, verify the required migrations are applied on the target database.
- Do not use `prisma db push` or `prisma migrate reset`.

## Validation

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Browser QA Status

Not run locally. Browser QA requires the API and web preview deployments to be synchronized.

## Migration Status

No schema changes and no migration added. No migration was applied.
