# Phase 1 Migration And Deployment Readiness Checklist

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Scope

Prepare exact migration and deployment readiness plan. Do not add features, modify application behavior, apply migrations, push, merge, deploy, run dev server, use `prisma db push`, or use `prisma migrate reset`.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 0 audit report.
- Completed: Verify Phase 32C migration file exists.
- Completed: Verify Phase 32D migration file exists.
- Completed: Check Phase 32C migration BOM status.
- Completed: Check Phase 32D migration BOM status.
- Completed: Check Phase 32C migration destructive SQL status.
- Completed: Check Phase 32D migration destructive SQL status.
- Completed: Verify Phase 32C and Phase 32D migration order.
- Completed: Verify dependent schema models/enums exist.
- Completed: Run `npx prisma validate --schema=prisma/schema.prisma`.
- Completed: Run `npx prisma generate --schema=prisma/schema.prisma`.
- Completed: Run API typecheck with low-memory setting.
- Completed: Run web typecheck with low-memory setting.
- Completed: Run web tests.
- Completed: Run shared build.
- Completed: Prepare migration status/deploy commands without running deploy.
- Completed: Prepare rollback/recovery notes.
- Completed: Prepare deployment readiness checklist.
- Completed: Prepare browser QA checklist.
- Completed: Create release runbook.
- Completed: Create implementation/readiness report.
- Completed: Stop before migration, push, deploy, or Phase 2.
