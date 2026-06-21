# Phase 32C Parent Engagement Implementation Report

Date: 2026-06-21
Branch: `phase-32-single-school-premium`
Scope: Parent Engagement Foundation only. This pass did not implement admissions, full academic setup, full library circulation, finance workflows, exams/results workflows, LMS, reports, or notification providers.

## Completed

- Parent portal is now a `Parent Engagement Hub` instead of the generic role dashboard.
- Linked children load from `GET /api/parent/children`, proxied to `GET /v1/parent/children`.
- Empty linked-child state uses the required message: `No child profile is linked to your account. Contact school administration.`
- Parent child selector uses only backend-linked child profiles.
- Selected child summary loads from `GET /api/parent/children/:studentId/summary`.
- Parent leave request list/timeline loads from `GET /api/parent/children/:studentId/leave-requests`.
- Parent leave request form submits to `POST /api/parent/children/:studentId/leave-requests`.
- Leave request timeline records are created on submit.
- School Admin review queue loads from `GET /api/school-admin/leave-requests`.
- School Admin review actions submit to `PATCH /api/school-admin/leave-requests/:id/review`.
- School Admin review creates a timeline event and stores reviewer/comment/reviewedAt.
- Parent attention card uses real data signals only: pending leave, fee records, homework count, results count, and message/notice count.
- Parent attention empty state uses the required message: `No urgent parent actions right now.`
- Parent summary cards use real response values or empty/setup states.

## Backend Routes Added

| UI action | Frontend route | Backend route | Method | Permission | Data source |
| --- | --- | --- | --- | --- | --- |
| Load linked children | `/api/parent/children` | `/v1/parent/children` | GET | `PARENT_PORTAL_ACCESS` | `StudentProfile` scoped by parent/school |
| Load child summary | `/api/parent/children/:studentId/summary` | `/v1/parent/children/:studentId/summary` | GET | `PARENT_PORTAL_ACCESS` | `TeacherAttendance`, `TeacherMark`, `TeacherAssignment`, `FeeRecord`, `ParentFeePayment`, `ParentCommunication`, `ParentPortalMessage`, `LeaveRequest` |
| List leave requests | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | GET | `PARENT_PORTAL_ACCESS` | `LeaveRequest`, `LeaveRequestTimeline` |
| Submit leave request | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` | POST | `PARENT_PORTAL_ACCESS` | `LeaveRequest`, `LeaveRequestTimeline` |
| Load review queue | `/api/school-admin/leave-requests` | `/v1/school-admin/leave-requests` | GET | `SCHOOL_OPERATIONS_MANAGE` | `LeaveRequest`, `StudentProfile`, `User`, `LeaveRequestTimeline` |
| Review leave request | `/api/school-admin/leave-requests/:id/review` | `/v1/school-admin/leave-requests/:id/review` | PATCH | `SCHOOL_OPERATIONS_MANAGE` | `LeaveRequest`, `LeaveRequestTimeline` |

## Permission Protections

- Parent routes require authenticated `PARENT_PORTAL_ACCESS`.
- Parent route scope requires `req.auth.schoolId`.
- Parent linked children are resolved by current project convention: `StudentProfile.guardianName === parent.name` and matching `schoolId`.
- Parent leave list/create endpoints reject child IDs outside the linked-child set with 403.
- Parent leave list is additionally filtered by `requestedById`.
- School Admin routes require `SCHOOL_OPERATIONS_MANAGE`.
- School Admin review queue and review mutation are scoped by `req.auth.schoolId`.
- School Admin review rejects missing/out-of-school leave request IDs with 404.
- Review transitions are limited to `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CLARIFICATION_REQUESTED` from active review states.

## Prisma Changes

Added enums:

- `LeaveRequestType`
- `LeaveRequestStatus`

Added models:

- `LeaveRequest`
- `LeaveRequestTimeline`

Updated relations:

- `User.leaveRequestsRequested`
- `User.leaveRequestsReviewed`
- `User.leaveRequestTimelineEvents`
- `School.leaveRequests`
- `StudentProfile.leaveRequests`

Migration added:

- `prisma/migrations/20260620130000_phase_32c_parent_leave_requests/migration.sql`

The migration was created but not applied in this pass.

Migration apply status: pending. It requires a database user/environment with permission to read/write _prisma_migrations; do not use db push or reset.

## Deferred

- Teacher leave context/review was deferred because current teacher assignment/student-class relations are not strong enough for safe teacher-scoped review without a larger academic setup slice.
- Full attendance mutation from approved leave was deferred.
- Library reading uploads/reading badges/challenges were deferred; parent UI shows a real setup/empty state.
- Notification provider integration was deferred.
- AI/risk scoring was not implemented.

## Validation

- `npx prisma validate`: Passed. Warning only about deprecated `package.json#prisma` config.
- `npm run typecheck --workspace @school-erp/web`: Passed after fixing the school-admin API helper signature.
- `npm run typecheck --workspace @school-erp/api`: Passed.
- `npm run test --workspace @school-erp/web`: Passed. Current script runs `node --experimental-strip-types lib/role-routes.test.ts`.
- `npm run build --workspace @school-erp/shared`: Passed.
- `npx prisma migrate status --schema=prisma/schema.prisma`: Reached the configured Neon database after elevated retry, then failed with `ERROR: permission denied for table _prisma_migrations`. No migration was applied.
- `npx prisma generate --schema=prisma/schema.prisma`: Passed after elevated retry; Prisma Client v6.19.3 generated locally.

## Notes

- Backend route prefix remains `/v1`.
- Frontend proxy prefix remains `/api`.
- Existing singular `/v1/parent` convention was preserved.
- No fake children, leave requests, dashboard counts, or static charts were added.
