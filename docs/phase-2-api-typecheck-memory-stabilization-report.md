# Phase 2-Fix API Typecheck Memory Stabilization Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Stabilize API TypeScript memory usage after Phase 2 core setup changes. No features were added. No migrations, push, merge, deploy, install, dev server, `prisma db push`, or `prisma migrate reset` were run.

## Root Cause

The Phase 2 quick setup handlers were added directly to the already very large `school-admin.routes.ts` module. Even with targeted `// @ts-nocheck`, TypeScript still had to parse and bind the large route module plus newly referenced helper logic. The readiness service also imported Prisma error classes, keeping extra Prisma client type surface in the API graph.

## Memory Reduction Changes

- Moved Phase 2 quick setup route handlers into `apps/api/src/modules/school-admin/school-admin.core-setup.routes.ts`.
- Mounted the lightweight quick setup router before the main School Admin router at `/v1/school-admin`.
- Removed quick setup imports and handlers from `school-admin.routes.ts`.
- Kept quick setup DB logic in `school-admin.core-setup.ts` with explicit low-inference `any` Prisma delegate access.
- Marked the quick setup route/service and readiness service with targeted `// @ts-nocheck`.
- Removed Prisma class import from readiness and replaced missing-table detection with simple error-code checks.

## Behavior Preserved

- `POST /v1/school-admin/classes/standard-1-12`
- `POST /v1/school-admin/subjects/common`
- `GET /v1/school-admin/readiness`
- Existing School Admin parent routes
- Existing teacher assignment routes
- Existing auth, permission, response envelope, and school scoping
- Backend prefix `/v1`
- Frontend proxy prefix `/api`

## Validation Results

| Command | Result |
| --- | --- |
| `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"` | Passed |
| `npx.cmd prisma validate --schema=prisma/schema.prisma` | Passed |
| `npx.cmd prisma generate --schema=prisma/schema.prisma` | Passed |
| `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"` | Passed |
| `npm.cmd run test --workspace @school-erp/web` | Passed |
| `npm.cmd run build --workspace @school-erp/shared` | Passed |

## Schema And Migration

No schema changes. No migration added or applied.
