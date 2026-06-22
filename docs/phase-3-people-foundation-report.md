# Phase 3 People Foundation Completion And Account Linking Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Summary

Phase 3 completed the people foundation wiring for students, teachers, parents/guardians, parent-child links, teacher login account compatibility, parent login account compatibility, teacher assignment selectors, and teacher portal assignment visibility. No Phase 4 modules were opened.

## Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- Phase 0, Phase 1, Phase 2, and Phase 2-Fix reports/manual QA
- `prisma/schema.prisma`
- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/teacher/teacher.routes.ts`
- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/web/components/dashboard/role-dashboard-foundation.tsx`
- `apps/web/components/layout/app-shell.tsx`
- Auth/password behavior through existing bcrypt-backed login service

## Root Cause: Teacher Assignment Class Selector

The class selector uses real `/api/school-admin/classes?pageSize=100` data. The remaining instability was not a backend class route issue. The teacher assignment form was receiving a dynamically rebuilt config object, and the generic form reset effect depended on the whole config object. That could reset form state while selector options loaded or changed, making the class selector appear empty or unstable even when classes existed.

## Changes Made

- Narrowed the generic resource form reset dependency to `config.resource` and `editing`, preventing teacher assignment form resets caused by rebuilt selector config.
- Kept teacher assignment class options mapped from real class rows through `optionLabelForClass`.
- Added clear student selector labels containing name, admission number, class, and status.
- Added teacher and parent temporary/reset password fields in School Admin forms.
- Added guidance that temporary passwords must be shared securely and changed later.
- Added backend teacher create/update account support using `User`, `SchoolMembership`, and existing bcrypt hashing.
- Added backend parent create/update password support and session revocation after password reset.
- Added teacher login state to teacher profile list responses by matching teacher profile email to teacher user membership.
- Added teacher dashboard assignment compatibility by matching logged-in teacher user email to `TeacherProfile` and counting `TeacherSubjectAssignment`.
- Added teacher profile summary rows to the teacher role dashboard.
- Fixed profile footer fallback so blank names render as `User` with `U` initials instead of an empty chip.
- Added parent list phone fallback from linked student guardian phone where available.

## Account Behavior

Teacher accounts:
- Creating a teacher with login enabled requires an email.
- For a new user, a temporary password is required.
- Existing users can be reused safely by email.
- A `TEACHER` school membership is created or activated.
- Passwords are hashed with bcrypt and never stored plaintext.
- Password reset revokes active sessions.
- `TeacherProfile` remains profile data; login compatibility is by email because the current schema has no direct `TeacherProfile.userId`.

Parent accounts:
- Creating a parent with login enabled requires an email.
- For a new user, a temporary password is required.
- Existing users can be reused safely by email.
- A `PARENT` school membership is created or updated.
- Password reset revokes active sessions.
- Parent-child visibility continues through `GuardianStudentLink`.

## Student Flow

Student create/edit/list remains real database backed. Student labels now include admission number and class context in parent linking selectors. No fake students or static rows were added.

## Parent-Child Linking

Parent-child linking remains school-scoped through `GuardianStudentLink`. The backend still validates the student belongs to the same school before linking. Parent portal compatibility remains based on linked children first.

## Teacher Assignment

Teacher assignment still requires teacher, class, and subject. Section remains optional and supports all sections. Assignment records continue to show teacher, class, section, subject, and status from real DB relations.

## Readiness

No readiness schema changes were required. Existing mutation flows continue to refresh resource lists and dashboard readiness after student, teacher, parent, parent-child link, and teacher assignment changes.

## Routes Changed

- `GET /v1/school-admin/teachers`: now includes login state derived from teacher user membership.
- `POST /v1/school-admin/teachers`: supports login-enabled account creation/linking and temporary password.
- `PATCH /v1/school-admin/teachers/:id`: supports login status/password updates through teacher account linking.
- `POST /v1/school-admin/parents`: supports temporary password for login-enabled parent accounts.
- `PATCH /v1/school-admin/parents/:parentId`: supports parent password reset.
- `GET /v1/teacher/dashboard`: includes real teacher assignment count and matched teacher profile when available.

No route prefixes changed.

## Schema And Migration

No Prisma schema change was made. No migration was added or applied.

Known schema limitation: `User` has no phone column and no dedicated parent profile table, so parent phone is not persistently stored as a parent field. The parent list shows linked student guardian phone when available.

## Permissions And Security

- School Admin people routes remain behind existing school admin permission middleware.
- Teacher dashboard remains behind teacher permission middleware.
- Teacher assignment counts are school-scoped.
- Parent links remain school-scoped.
- Passwords are bcrypt hashed.
- Active sessions are revoked when password reset occurs.
- No raw Prisma errors were intentionally exposed.

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Initial API typecheck at 768MB OOMed before adding the targeted memory safeguard to `teacher.routes.ts`.
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Failed diagnostic: `cmd /c "set NODE_OPTIONS=--max-old-space-size=688 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"` still OOMs near the heap limit. The project currently needs 768MB for the full API typecheck.
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Browser QA Status

Not run in this pass. Per project rules, no dev server was started and no deployment was performed.

## Unverified Items

- Live browser confirmation of newly created teacher login.
- Live browser confirmation of teacher assignment count on deployed teacher portal.
- Live browser confirmation of parent temporary password login.
- Preview requires latest deployment and required migrations applied to the target database before full QA.

## Next Recommendation

Proceed to Phase 4 only after Project Owner approval and after Phase 3 browser QA confirms teacher login, parent login, teacher assignment selector, and parent-child visibility.
