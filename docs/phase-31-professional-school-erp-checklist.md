# Phase 31 Professional School ERP Checklist

Status values: Pending, In Progress, Completed, Blocked.

Scope for this pass: complete only Modern Real-Data Dashboard Analytics and School Admin Foundation. Admissions, academic setup, teacher management, library workflows, exams, fees, LMS, attendance, timetable, notices, and reports implementation remain out of scope for this pass.

## Planning And Audit

| Item | Status | Notes |
| --- | --- | --- |
| Phase 31 checklist | Completed | Created before Phase 31 implementation and updated after validation. |
| Phase 31 route matrix | Completed | Created before Phase 31 implementation and updated after validation. |
| Phase 31 current audit | Completed | Created before Phase 31 implementation and updated after validation. |

## Dashboard Analytics

| Item | Status | Notes |
| --- | --- | --- |
| Super Admin schools by status chart | Completed | Uses `/v1/super-admin/dashboard` real `School` status grouping. |
| Super Admin users by role chart | Completed | Uses real `SchoolMembership` grouped by `Role`. |
| Super Admin new schools over time chart | Completed | Uses real `School.createdAt` monthly buckets from `/v1/super-admin/dashboard`. |
| Super Admin campuses per school widget | Completed | Uses real `School` with campus counts from `/v1/super-admin/dashboard`. |
| Super Admin administrator status summary | Completed | Uses real administrator membership status counts. |
| Super Admin recent activity timeline | Completed | Uses real `AuditLog` rows. |
| School Admin students by class chart | Completed | Uses real `StudentProfile.className` grouping. Empty state if none. |
| School Admin admissions by status chart | Completed | Uses real `AdmissionApplication.status` grouping. Empty state if none. |
| School Admin attendance status chart | Completed | Uses real `AttendanceRecord.status` grouping. Empty state if none. |
| School Admin fee status chart | Completed | Uses real `FeeRecord.status` grouping and amount sum in payload. Empty state if none. |
| School Admin exam status chart | Completed | Uses real `ExamRecord.status` grouping. Empty state if none. |
| School Admin library status chart | Completed | Uses real `LibraryBook.status` grouping. Empty state if none. |
| School Admin LMS progress summary | Completed | Backend returns real `LmsProgress.status` grouping; not rendered as a primary chart yet. |
| Dashboard loading states | Completed | Super Admin and School Admin dashboards render loading states. |
| Dashboard empty states | Completed | Chart/list panels render empty states when arrays are empty. |
| Dashboard error/retry states | Completed | Dashboard fetch errors expose retry actions. |
| No fake/static chart values | Completed | Dashboard widgets use normalized backend payloads only. |

## School Admin Foundation

| Item | Status | Notes |
| --- | --- | --- |
| School Admin can login | Completed | Existing auth service creates role session; route redirect was validated by tests. |
| School Admin redirects to dashboard | Completed | `homePathForRole(SCHOOL_ADMIN)` is `/school-admin`; test covers it. |
| School Admin sees assigned school only | Completed | `/v1/school-admin/dashboard` requires token `schoolId` and queries by that school. |
| School Admin cannot access Super Admin routes | Completed | Middleware policy blocks `/super-admin`; test covers it. |
| School Admin dashboard school name | Completed | Dashboard returns and renders real `School.name`. |
| School Admin dashboard campuses count | Completed | Uses real `Campus.count({ schoolId })`. |
| School Admin dashboard teachers count | Completed | Uses real `TeacherProfile.count({ schoolId })`. |
| School Admin dashboard students count | Completed | Uses real `StudentProfile.count({ schoolId })`. |
| School Admin dashboard parents count | Completed | Uses real active `PARENT` memberships for the school. |
| School Admin dashboard classes count | Completed | Uses real `ClassLevel.count({ schoolId })`. |
| School Admin dashboard sections count | Completed | Uses real `Section.count({ schoolId })`. |
| School Admin dashboard subjects/courses count | Completed | Uses real `Subject.count({ schoolId })`. |
| School Admin dashboard admissions count | Completed | Uses real `AdmissionApplication.count({ schoolId })`. |
| School Admin dashboard library books count | Completed | Uses real `LibraryBook.count({ schoolId })`. |
| School Admin dashboard exams count | Completed | Uses real `ExamRecord.count({ schoolId })`. |
| School Admin dashboard fees summary | Completed | Uses real `FeeRecord` count/status/amount aggregation. |
| School Admin recent school activity | Completed | Uses real school-scoped `AuditLog` rows. |
| School Admin navigation includes required modules | Completed | Sidebar includes Dashboard, Teachers, Students, Parents, Classes, Sections, Subjects/Courses, Attendance, Timetable, Exams, Fees, Library, Notices, Reports, Settings. |
| Unfinished modules use Coming Soon cards | Completed | Non-dashboard modules are in-page cards with no route navigation. |
| School Admin loading/empty/error states | Completed | Dashboard and chart panels include loading, empty, error, and retry states. |

## Later ERP Modules Not Started In This Pass

| Module | Status | Notes |
| --- | --- | --- |
| Admissions workflow | Pending | Explicitly out of scope for this pass. |
| Academic setup implementation | Pending | Explicitly out of scope for this pass. |
| Teacher management | Pending | Explicitly out of scope for this pass. |
| Student and parent management | Pending | Explicitly out of scope for this pass. |
| Library module implementation | Pending | Explicitly out of scope for this pass. |
| Examination module implementation | Pending | Explicitly out of scope for this pass. |
| Attendance module implementation | Pending | Explicitly out of scope for this pass. |
| Timetable module implementation | Pending | Explicitly out of scope for this pass. |
| Fees/finance implementation | Pending | Explicitly out of scope for this pass. |
| LMS implementation | Pending | Explicitly out of scope for this pass. |
| Notices/communication implementation | Pending | Explicitly out of scope for this pass. |
| Reports implementation | Pending | Explicitly out of scope for this pass. |

## Validation

| Command | Status | Notes |
| --- | --- | --- |
| `npm run build --workspace @school-erp/shared` | Completed | Passed with low-memory `NODE_OPTIONS`. |
| `npm run test --workspace @school-erp/web` | Completed | Passed with low-memory `NODE_OPTIONS`. |
| `npm run typecheck --workspace @school-erp/web` | Completed | Passed with low-memory `NODE_OPTIONS`. |
| `npm run typecheck --workspace @school-erp/api` | Completed | Passed with low-memory `NODE_OPTIONS`; run because API route changed. |
| `npx prisma validate` | Completed | Passed; Prisma emitted only package config deprecation warning. |
| Prisma generate | Pending | Not needed; schema was not changed. |
