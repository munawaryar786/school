# Phase 1 Release Runbook

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Purpose

This runbook prepares the safe sequence for Phase 32D migration verification/application and Preview release sync. Do not run migration deploy, push, or redeploy without Project Owner approval.

## Preflight

1. Confirm branch:

```powershell
git branch --show-current
```

Expected:

```text
phase-32-single-school-premium
```

2. Confirm working tree:

```powershell
git status
```

3. Confirm migration files exist:

```powershell
Test-Path prisma\migrations\20260620130000_phase_32c_parent_leave_requests\migration.sql
Test-Path prisma\migrations\20260621120000_phase_32d_core_people_foundation\migration.sql
```

4. Confirm validation:

```powershell
npx.cmd prisma validate --schema=prisma/schema.prisma
npx.cmd prisma generate --schema=prisma/schema.prisma
cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"
cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"
npm.cmd run test --workspace @school-erp/web
npm.cmd run build --workspace @school-erp/shared
```

## Migration Commands Prepared But Not Run

Use a Neon direct URL for migration commands. It must not contain `-pooler`. It should include `sslmode=require`.

Set direct migration URL:

```powershell
$env:DATABASE_URL="<NEON_DIRECT_NON_POOLER_URL_WITH_SSLMODE_REQUIRE>"
```

Check migration status:

```powershell
npx.cmd prisma migrate status --schema=prisma/schema.prisma
```

Apply pending migrations only after Project Owner approval:

```powershell
npx.cmd prisma migrate deploy --schema=prisma/schema.prisma
```

Remove the direct URL from the current shell:

```powershell
Remove-Item Env:DATABASE_URL
```

## Migration Recovery Notes

If migration fails with BOM:

1. Stop.
2. Remove BOM from the failing `migration.sql`.
3. Re-run:

```powershell
npx.cmd prisma migrate status --schema=prisma/schema.prisma
```

If migration is recorded failed with `P3009` or `P3018`:

1. Stop and inspect the failed migration name from Prisma output.
2. Confirm no partial unsafe DB state exists.
3. Only after confirming the failure state, run:

```powershell
npx.cmd prisma migrate resolve --rolled-back <migration_name> --schema=prisma/schema.prisma
npx.cmd prisma migrate deploy --schema=prisma/schema.prisma
```

If DB permission is denied:

1. Stop.
2. Confirm the URL is the direct non-pooler Neon URL.
3. Use a database role with permission to read/write `_prisma_migrations` and create types/tables/indexes/foreign keys.

Never use:

```powershell
npx.cmd prisma db push
npx.cmd prisma migrate reset
```

## Deployment Checklist Prepared

Do not deploy until migration status/apply is approved and completed.

1. Commit current branch after review.
2. Push `phase-32-single-school-premium` only after Project Owner approval.
3. Redeploy `school-api` Preview first.
4. Redeploy `school-com` Preview second.
5. In Vercel, use existing Build Cache unchecked for both redeploys.
6. Confirm `school-com` `NEXT_PUBLIC_API_URL` points to latest `school-api` Preview origin.
7. Confirm `school-api` `WEB_ORIGIN` points to latest `school-com` Preview origin.
8. Environment URLs must have:
   - no trailing slash
   - no `/api`
   - no `/v1`
9. Runtime `school-api` `DATABASE_URL` must remain pooled:
   - contains `-pooler`
   - includes `sslmode=require`
10. Migration command URL must remain direct and must not be saved as runtime pooled `DATABASE_URL`.

## Browser QA Checklist

After migration and redeploy:

1. Open `/school-admin`.
2. Confirm dashboard and readiness load.
3. Open Parents module.
4. Confirm no raw `Route not found`.
5. Confirm no `Parent management API is unavailable. Retry after deployment.`
6. Create or select a parent.
7. Link parent to an existing student.
8. Confirm parent-child link persists.
9. Open Teachers module.
10. Create teacher assignment.
11. Confirm teacher assignment persists and readiness updates.
12. Open `/parent`.
13. Login as linked parent.
14. Confirm linked child appears.
15. Submit leave request.
16. Login as School Admin.
17. Open leave review queue.
18. Approve/reject/clarification review.
19. Login as parent again.
20. Confirm leave timeline/status updates.

Failure checks:

- No raw route errors.
- No old Phase 32B placeholder text.
- No fake data.
- Parent cannot see unrelated child.
- School Admin cannot link cross-school records.
- Teacher assignment rejects cross-school records.
- Locked modules remain gated until dependencies are complete.

## If Route Errors Remain After Deploy

1. Confirm `school-com` `NEXT_PUBLIC_API_URL` is latest `school-api` Preview origin.
2. Confirm `school-api` `WEB_ORIGIN` is latest `school-com` Preview origin.
3. Confirm neither env value has trailing slash, `/api`, or `/v1`.
4. Confirm API redeploy happened before web redeploy.
5. Confirm `/v1/health/db` on API Preview is healthy.
6. Confirm route path directly on API Preview, for example:

```text
<school-api-preview-origin>/v1/school-admin/readiness
```

7. If direct API returns route not found, the API deployment is stale or wrong project/branch.
8. If direct API route exists but web fails, the web env or proxy target is stale.

## If Web Points To Old API URL

1. Update `NEXT_PUBLIC_API_URL` in `school-com` Preview env to latest API Preview origin.
2. Redeploy `school-com` with existing Build Cache unchecked.
3. Re-run browser QA.

## Stop Gate

Stop before applying migration, pushing, or deploying unless Project Owner explicitly approves the exact next action.
