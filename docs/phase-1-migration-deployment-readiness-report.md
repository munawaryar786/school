# Phase 1 Migration And Deployment Readiness Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Scope

Phase 1 prepared migration and deployment readiness only. No application behavior was changed. No feature work was started. No migration was applied. No push, merge, deploy, dev server, `prisma db push`, or `prisma migrate reset` was run.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-0-current-state-audit-report.md`
- `prisma/migrations/20260620130000_phase_32c_parent_leave_requests/migration.sql`
- `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`
- `prisma/schema.prisma`
- Current git status
- Validation command results

## Migration Safety Result

Phase 32C migration:

- Path: `prisma/migrations/20260620130000_phase_32c_parent_leave_requests/migration.sql`
- Exists: yes
- BOM: no
- Destructive SQL: no `DROP`, `TRUNCATE`, or `DELETE FROM`
- Adds: `LeaveRequestType`, `LeaveRequestStatus`, `LeaveRequest`, `LeaveRequestTimeline`
- Uses `ALTER TABLE` only to add foreign-key constraints for Phase 32C tables.

Phase 32D migration:

- Path: `prisma/migrations/20260621120000_phase_32d_core_people_foundation/migration.sql`
- Exists: yes
- BOM: no
- Destructive SQL: no `DROP`, `TRUNCATE`, or `DELETE FROM`
- Adds: `GuardianRelationType`, `GuardianStudentLink`, `TeacherSubjectAssignment`
- Uses `ALTER TABLE` only to add foreign-key constraints for Phase 32D tables.

Migration order:

- Correct. Phase 32C timestamp `20260620130000` runs before Phase 32D timestamp `20260621120000`.

## Schema Verification

Confirmed in `prisma/schema.prisma`:

- `GuardianRelationType`
- `LeaveRequestType`
- `LeaveRequestStatus`
- `GuardianStudentLink`
- `TeacherSubjectAssignment`
- `LeaveRequest`
- `LeaveRequestTimeline`

`npx.cmd prisma validate --schema=prisma/schema.prisma` passed, which confirms schema relations are valid from Prisma's perspective.

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npx.cmd prisma validate --schema=prisma/schema.prisma` | Passed | Prisma config deprecation warning only. |
| `npx.cmd prisma generate --schema=prisma/schema.prisma` | Passed on retry | First parallel attempt hit `The system cannot execute the specified program`; retry passed and generated Prisma Client v6.19.3. |
| `NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64 npm.cmd run typecheck --workspace @school-erp/api` | Passed | Low-memory API typecheck passed. |
| `NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64 npm.cmd run typecheck --workspace @school-erp/web` | Failed | OOM at 768 MB. |
| `NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64 npm.cmd run typecheck --workspace @school-erp/web` | Passed | Web typecheck needs 1024 MB on this machine. |
| `npm.cmd run test --workspace @school-erp/web` | Passed | Role routes test passed. |
| `npm.cmd run build --workspace @school-erp/shared` | Passed | Shared package build passed. |

## Migration Commands Prepared But Not Run

Use a direct Neon URL for migration commands. It must not contain `-pooler`. It should include `sslmode=require`.

Set direct migration URL:

```powershell
$env:DATABASE_URL="<NEON_DIRECT_NON_POOLER_URL_WITH_SSLMODE_REQUIRE>"
```

Check status:

```powershell
npx.cmd prisma migrate status --schema=prisma/schema.prisma
```

Apply after Project Owner approval only:

```powershell
npx.cmd prisma migrate deploy --schema=prisma/schema.prisma
```

Remove direct URL from shell:

```powershell
Remove-Item Env:DATABASE_URL
```

Recovery if `P3009` or `P3018` occurs:

```powershell
npx.cmd prisma migrate resolve --rolled-back <migration_name> --schema=prisma/schema.prisma
npx.cmd prisma migrate deploy --schema=prisma/schema.prisma
```

Only use the recovery command after confirming the failed migration state. Do not manually create production tables.

Never run:

```powershell
npx.cmd prisma db push
npx.cmd prisma migrate reset
```

## Deployment Checklist

Prepared sequence after Project Owner approval:

1. Commit current code/docs.
2. Push branch `phase-32-single-school-premium`.
3. Redeploy `school-api` Preview first.
4. Redeploy `school-com` Preview second.
5. Use existing Build Cache unchecked for both redeploys.
6. Confirm `school-com` `NEXT_PUBLIC_API_URL` points to latest `school-api` Preview origin.
7. Confirm `school-api` `WEB_ORIGIN` points to latest `school-com` Preview origin.
8. Confirm env origins have:
   - no trailing slash
   - no `/api`
   - no `/v1`
9. Confirm runtime API `DATABASE_URL` remains pooled:
   - contains `-pooler`
   - includes `sslmode=require`
10. Confirm migration commands use direct non-pooler URL only in the migration shell/session.

## Browser QA Checklist

After migration and redeploy:

1. Open `/school-admin`.
2. Confirm readiness route loads.
3. Open Parents module.
4. Confirm no raw `Route not found`.
5. Confirm no `Parent management API is unavailable. Retry after deployment.`
6. Link parent to student.
7. Confirm linked child count updates.
8. Open Teachers module.
9. Create teacher assignment.
10. Confirm readiness updates.
11. Open `/parent`.
12. Login as linked parent.
13. Confirm linked child appears.
14. Submit leave request.
15. Login as School Admin.
16. Verify leave request appears in review queue.
17. Approve/reject/clarification request.
18. Login as parent again.
19. Confirm timeline/status updates.

Failure checks:

- No raw route errors.
- No old Phase 32B placeholder.
- No fake data.
- Parent cannot see unrelated child.
- School Admin cannot link cross-school records.
- Teacher assignment rejects cross-school records.
- Locked modules remain dependency-gated.

## Rollback And Recovery Notes

If migration fails with BOM:

- Stop.
- Remove BOM from the failing `migration.sql`.
- Re-run migrate status before any deploy.

If migration is recorded failed:

- Stop.
- Inspect Prisma error and failed migration name.
- Confirm no partial unsafe DB state.
- Use `prisma migrate resolve --rolled-back <migration_name>` only after confirming failure state.
- Re-run `prisma migrate deploy`.

If route errors remain after deploy:

- Confirm API Preview is the latest deployment from this branch.
- Confirm web Preview was redeployed after API Preview.
- Confirm `NEXT_PUBLIC_API_URL` points to the latest API Preview origin.
- Confirm `WEB_ORIGIN` points to the latest web Preview origin.
- Confirm neither env value contains trailing slash, `/api`, or `/v1`.
- Test direct API Preview route such as `/v1/school-admin/readiness`.

If DB permission is denied:

- Stop.
- Use a direct non-pooler Neon URL with a role that can read/write `_prisma_migrations` and create required database objects.
- Do not use runtime pooled URL for migrations.

If web points to old API URL:

- Update `NEXT_PUBLIC_API_URL`.
- Redeploy `school-com` Preview with existing Build Cache unchecked.
- Repeat browser QA.

## Safe Decisions

Safe to apply migration:

- Yes, from SQL/schema readiness perspective, after Project Owner approval and only with a direct non-pooler Neon URL with sufficient permissions.
- No, from process perspective until Project Owner explicitly approves migration apply.

Safe to commit:

- Yes, current changes are docs/readiness only.

Safe to push:

- Not until Project Owner explicitly approves.

Safe to deploy:

- Not until Project Owner approves push/redeploy and migration status/apply is handled.

## What Was Changed

Docs only:

- Created `docs/phase-1-migration-deployment-readiness-checklist.md`
- Created `docs/phase-1-migration-deployment-readiness-report.md`
- Created `docs/phase-1-release-runbook.md`

## Routes Added Or Changed

None.

## Frontend Files Changed

None.

## Backend Files Changed

None.

## Schema Or Migration Changes

None.

## Permissions And Security Notes

- Runtime Vercel API `DATABASE_URL` must remain pooled.
- Migration commands must use direct non-pooler Neon URL only for migration shell/session.
- Current configured pooled DB user previously could not read `_prisma_migrations`; migration apply requires a database role with sufficient permissions.

## Migration Status

Not applied in Phase 1.

Known from Phase 0:

- Current configured DB user cannot confirm migration status because `_prisma_migrations` permission is denied.
- Phase 32D migration must be considered pending until checked/applied with the authorized direct Neon migration URL.

## Browser QA Status

Not run. No dev server was started and no Preview deployment was changed.

## Unverified Items

- Actual target DB migration status remains unverified until Project Owner uses the direct Neon migration URL.
- Preview env values are not verified from Vercel UI in this local pass.
- Browser QA remains pending until migration and redeploy are approved/completed.

## Git Status

Expected current untracked docs:

```text
?? docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md
?? docs/phase-0-current-state-audit-checklist.md
?? docs/phase-0-current-state-audit-report.md
?? docs/phase-1-migration-deployment-readiness-checklist.md
?? docs/phase-1-migration-deployment-readiness-report.md
?? docs/phase-1-release-runbook.md
```

## Recommended Next Step

Project Owner should review this Phase 1 report and runbook, then explicitly approve one of:

- commit only
- migration status check with direct Neon URL
- migration deploy with direct Neon URL
- push branch
- redeploy Preview

Do not start Phase 2 until migration/deployment readiness is resolved and Project Owner confirms.
