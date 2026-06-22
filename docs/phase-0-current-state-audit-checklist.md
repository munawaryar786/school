# Phase 0 Current State Audit And Release Sync Checklist

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Scope

Audit current local project state, pending files, migrations, route availability, proxy behavior, and likely Preview error causes. Do not add features, apply migrations, push, merge, deploy, or modify application behavior.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read relevant Phase 32B, 32C, 32D, 32D-Fix, 32E, and 32E-Fix docs.
- Completed: Inspect git branch and status.
- Completed: List modified tracked files.
- Completed: List untracked files.
- Completed: Inspect migration files related to Phase 32C and Phase 32D.
- Completed: Check Phase 32D migration SQL for BOM.
- Completed: Check Phase 32D migration SQL for unsafe drop/alter statements.
- Completed: Determine whether Phase 32D migration must be applied before browser QA.
- Completed: Inspect local backend routes for School Admin parents.
- Completed: Inspect local backend route for School Admin parent-child linking.
- Completed: Inspect local backend routes for teacher assignments.
- Completed: Inspect local backend route for readiness.
- Completed: Inspect local backend parent routes for children and leave requests.
- Completed: Inspect frontend School Admin API calls.
- Completed: Inspect frontend Parent Portal API calls.
- Completed: Inspect frontend `/api` proxy behavior.
- Completed: Build exact route matrix.
- Completed: Determine likely causes for current Preview errors.
- Completed: Write Phase 0 audit report.
- Completed: Stop before Phase 1.
