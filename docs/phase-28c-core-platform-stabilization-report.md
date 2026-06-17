# Phase 28C Core Platform Stabilization Report

Status: Completed with environment validation blocker.

Phase 28C was approved by the Project Owner on 2026-06-18 with the instruction: "yes start phase 28c".

## Implemented Stabilization Slice

### Role Landing Path Consistency

Fixed the Phase 28A finding where `FINANCE_OFFICER`, `LIBRARIAN`, and `HR_OFFICER` landed inconsistently across login, auth helper, and middleware.

New shared source:

- `apps/web/lib/role-routes.ts`

Updated consumers:

- `apps/web/components/auth/login-view.tsx`
- `apps/web/lib/auth.ts`
- `apps/web/middleware.ts`

Current role home paths:

| Role | Home path |
| --- | --- |
| `SUPER_ADMIN` | `/super-admin` |
| `SCHOOL_ADMIN` | `/school-admin` |
| `TEACHER` | `/teacher` |
| `STUDENT` | `/student` |
| `PARENT` | `/parent` |
| `STAFF` | `/school-admin` |
| `FINANCE_OFFICER` | `/finance` |
| `LIBRARIAN` | `/library` |
| `HR_OFFICER` | `/hr` |

### Regression Coverage

Added a narrow web regression check:

- `apps/web/lib/role-routes.test.ts`

Added web test script:

- `apps/web/package.json`

The test verifies:

- Finance Officer lands on `/finance`.
- Librarian lands on `/library`.
- HR Officer lands on `/hr`.
- Every shared role has a home path.

The test uses Node 22 built-in TypeScript stripping to avoid the local environment's `tsx`/esbuild child-process spawn failure.

## Continued Phase 28C Slice - Route Policy Centralization

After Project Owner approval to continue Phase 28C, frontend route access metadata was centralized.

New shared route policy source:

- `apps/web/lib/route-policy.ts`

Updated consumer:

- `apps/web/middleware.ts`

The middleware now uses:

- `findProtectedPrefix(pathname)`
- `canAccessRoute(role, pathname)`

This removes the route access matrix from middleware and makes it directly testable without invoking Next.js middleware runtime.

Regression coverage in `apps/web/lib/role-routes.test.ts` now verifies:

- Protected prefix matching.
- Finance, HR, and library role access.
- Denial for unauthorized role/page combinations.
- Route policy prefixes match route policy keys.
- Every protected route has at least one allowed role.

## Typecheck Script Stabilization

Updated `apps/web/package.json`:

- `typecheck` now runs `tsc -p tsconfig.json --noEmit --incremental false`.

Reason:

- The previous typecheck attempted to write `apps/web/tsconfig.tsbuildinfo` and failed with `EPERM`.

Updated `apps/web/tsconfig.json`:

- Enabled `allowImportingTsExtensions` so Node 22 strip-types tests can import local TypeScript modules explicitly.

## Continued Phase 28C Slice - API Proxy Guardrail

After Project Owner requested the next slice, API proxy URL construction was extracted into a pure helper so it can be tested without loading Next.js server modules.

New pure helper:

- `apps/web/lib/api-routing.ts`

Updated proxy:

- `apps/web/lib/api-proxy.ts`

Regression coverage in `apps/web/lib/role-routes.test.ts` now verifies:

- `backendUrl("/health")` maps to the backend health path.
- `backendModuleUrl("school-admin", ["dashboard"])` maps to `/v1/school-admin/dashboard`.
- Module URLs preserve query strings.
- Super Admin nested paths map under `/v1/super-admin/...`.

This preserves the production rule that browser `/api/*` routes proxy to backend `/v1/*` routes and does not restore `/api/v1`.

## Final Phase 28C Slice - Role Theme Accent Stabilization

Role accent classes were aligned with the Phase 28B design-system direction.

Updated shared role theme source:

- `packages/shared/src/theme.ts`

Updated CSS variables:

- `apps/web/app/globals.css`

Changes:

| Role | Previous | Current |
| --- | --- | --- |
| `FINANCE_OFFICER` | `accent: blue`, `theme-school-admin` | `accent: amber`, `theme-finance` |
| `LIBRARIAN` | `theme-academic` | `theme-library` |
| `HR_OFFICER` | `accent: blue`, `theme-school-admin` | `accent: warm-neutral`, `theme-hr` |

Regression coverage in `apps/web/lib/role-routes.test.ts` now verifies these role theme assignments.

`npm run build --workspace @school-erp/shared` was run successfully so generated shared package output remains in `packages/shared/dist`, not `packages/shared/src`.

## Commands Executed

| Command | Result |
| --- | --- |
| `git status --short` | Passed; showed existing modified logout route plus Phase docs |
| `git diff -- apps/web/app/api/auth/logout/route.ts` | Passed; existing change is a blank line not made in Phase 28C |
| `Select-String` route mapping checks | Passed |
| `npm run test --workspace @school-erp/web` with Node test runner | Failed: `spawn EPERM` |
| `npm run test --workspace @school-erp/web` with `tsx` | Failed: `spawn EPERM` from esbuild |
| `node --experimental-strip-types apps/web/lib/role-routes.test.ts` | Failed because bundler-style extensionless import could not resolve |
| `npm run typecheck --workspace @school-erp/web` | Failed: Node fatal out-of-memory |
| `npm run test --workspace @school-erp/web` after switching test script to Node strip-types | Passed |
| `npm run test --workspace @school-erp/web` after route-policy centralization | Passed |
| `npm run typecheck --workspace @school-erp/web` after script/type fixes | Failed: Node fatal out-of-memory; earlier TS errors were addressed |
| `npm run test --workspace @school-erp/web` after API proxy guardrail | Passed |
| `npm run typecheck --workspace @school-erp/web` after API proxy guardrail | Failed: Node fatal out-of-memory |
| `npm run build --workspace @school-erp/shared` after role theme changes | Passed |
| `npm run test --workspace @school-erp/web` after role theme changes | Passed |
| `npm run typecheck --workspaces --if-present` final Phase 28C attempt | Failed: local Node heap/out-of-memory during API and web typechecks |
| `npm run build --workspace @school-erp/web` final Phase 28C attempt | Failed: local Node heap/out-of-memory during Next build |

## Validation Status

Passed:

- Focused role landing regression test.
- Source-level route mapping sanity check.
- Focused route-policy regression test.
- Focused API proxy URL guardrail test.
- Shared package build after theme changes.
- Focused role theme regression test.

Blocked:

- Full web typecheck remains blocked by local Node fatal out-of-memory.
- Full workspace typecheck/test/build remain blocked until local memory/paging-file issues are resolved.

## Guardrails Preserved

- No backend route prefix changes.
- No `/health` changes.
- No frontend `/api/*` proxy changes.
- No Prisma schema changes.
- No migrations.
- No environment variable changes.
- No Vercel config changes.
- No database writes.

## Existing Worktree Note

`apps/web/app/api/auth/logout/route.ts` had a pre-existing blank-line modification before Phase 28C edits. It was inspected and intentionally left untouched.

## Next Recommended Phase 28C Slice

Phase 28C implementation work is stopped here.

Completed safe stabilization slices:

1. Role landing path consistency.
2. Frontend route policy centralization.
3. API proxy guardrail.
4. Role theme accent stabilization.
5. Focused lightweight regression coverage.

Phase 28C remaining blocker:

- Full workspace typecheck and web build cannot complete in this local environment due Node heap/out-of-memory failures.

Recommended next step before Phase 28D:

1. Run validation in a machine/session with enough memory or CI.
2. Confirm `npm run typecheck --workspaces --if-present`.
3. Confirm root `npm run build`.
4. Confirm production health, login, and proxy regression smoke tests.

Do not start Phase 28D enterprise module implementation until the Project Owner accepts the validation blocker or provides a stable validation environment.
