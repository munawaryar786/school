# Phase 30 Current ERP Audit

Audit date: 2026-06-19.
Branch: `phase-29-enterprise-dashboard`.

This audit was produced before Phase 30 implementation work. It is source-based unless a validation command is explicitly listed later.

## Working Features

| Area | Finding |
| --- | --- |
| Backend route base | Express app mounts protected modules under `/v1/*` and does not mount backend `/api/v1`, preserving the required backend route shape. |
| Frontend proxy base | Next route handlers under `/api/<module>/[...path]` forward to backend `/v1/<module>`, preserving frontend `/api` proxy routing. |
| Authentication | Login service validates password, selects an active membership, issues JWT with role, schoolId, membershipId, and permissions, and creates a session. |
| Role permissions | Shared permission matrix includes Super Admin, School Admin, Teacher, Student, Parent, Staff, Finance Officer, Librarian, and HR Officer. |
| Super Admin school CRUD backend | `/v1/super-admin/schools` supports list/search/status/sort/pagination/create/edit/archive/activate/suspend with permission checks and audit writes. |
| Super Admin campus CRUD backend | `/v1/super-admin/campuses` supports list/search/status/sort/pagination/create/edit/archive with schoolId and audit writes. |
| Super Admin administrator CRUD backend | `/v1/super-admin/administrators` creates a real `User` plus `SCHOOL_ADMIN` `SchoolMembership`; edit and activate exist. |
| Super Admin frontend proxy | `/api/super-admin/*` maps to `/v1/super-admin/*`. |
| School Admin generic school-scoped backend | `/v1/school-admin/:resource` scopes CRUD to `req.auth.schoolId` for academic years, classes, sections, subjects, teachers, students, fees, exams, attendance, library, and timetable. |
| Seed/demo roles | Seed contains demo users for major roles and should be preserved. |
| Existing tests | API tests exist for auth service and Super Admin routes; web route tests exist. |

## Partially Working Features

| Area | Finding |
| --- | --- |
| Super Admin dashboard | Uses real DB queries, but payload omits archived schools and administrator-specific metrics required by Phase 30. |
| Super Admin recent activity | Reads real `AuditLog`, but only filters resources `administrator`, `school`, and `campus`, and needs UI validation after create/update actions. |
| Super Admin administrator list | Lists real `SchoolMembership` rows for `SCHOOL_ADMIN`, but omits `createdAt`, `updatedAt`, and explicit school filter support. |
| Super Admin school detail | Backend has `/schools/:id`, but payload does not include required user/teacher/student/parent/library counts or recent school activity. Frontend view uses selected table row instead of fetching this detail route. |
| Super Admin UI | Has metric cards, bar-list charts, status badges, loading/empty/error panels, and form validation, but still uses portal tabs instead of a modern enterprise dashboard structure. |
| School Admin login | Created admin should be able to login because a real user and active membership are created, but this has not been validated in Phase 30. |
| School Admin dashboard | Uses real counts from DB, but lacks school name, campus count, parent count, attendance/fee summaries, and recent activity. |
| Academic setup | Prisma models exist for `AcademicYear`, `AcademicTerm`, `ClassLevel`, `Section`, and `Subject`; the School Admin UI only exposes a generic CRUD subset. |
| Teacher management | School Admin can create `TeacherProfile`, but not a login-capable teacher `User`/membership. Assignments to subjects/classes are missing from the workflow. |
| Student management | School Admin can create `StudentProfile`, but not a login-capable student account, parent links, or section assignment. |
| Library | `LibraryBook` and related issue/return/fine models exist; School Admin generic library CRUD only uses partial book fields. Librarian portal exists but needs validation. |
| Finance, HR, communication, reports, attendance, exams | Module routes and portals exist, but many are generic CRUD surfaces and not validated end-to-end against Phase 30 acceptance criteria. |

## Broken Features

| Area | Finding |
| --- | --- |
| Super Admin dashboard administrator visibility | Admins are created as `User` + `SchoolMembership`, but dashboard does not expose total/active/suspended school administrator counts. |
| Super Admin archived school count | Archived schools are excluded by `deletedAt: null` in the dashboard total and no archived metric is returned. |
| School detail admin visibility | Current frontend does not fetch `/api/super-admin/schools/:id`; it shows only the row selected from the school list, so assigned admins/campuses/counts are hidden from the detail view. |
| Administrator created date visibility | Backend list response drops membership `createdAt` and `updatedAt`, so the frontend cannot display created date. |
| Explicit administrator suspend action | Backend only suspends through `DELETE /administrators/:id`; required explicit activate/suspend workflow is incomplete. |
| School Admin hard deletes | Generic `DELETE /v1/school-admin/:resource/:id` deletes records rather than archiving/status-changing them, which conflicts with many module requirements. |
| School Admin placeholder form defaults | Form defaults include sample teacher, student, attendance, library, and timetable values that can become fake production data if submitted. |

## Missing Features

| Area | Finding |
| --- | --- |
| School Admin complete navigation | Parents, notices, reports, and settings are missing from School Admin navigation; missing modules do not have clean Coming Soon states. |
| Academic teacher-subject assignment | No explicit `TeacherSubjectAssignment` model/workflow found in the audited school-admin foundation. |
| Class-section-subject structure view | Missing. |
| Teacher account creation | Missing User + TEACHER membership creation from School Admin. |
| Student/parent account creation and linkage | Missing from School Admin workflow. |
| Attendance foundation | Required classId/sectionId/studentId/date/status/markedBy structure and duplicate prevention are not validated; current generic attendance shape appears insufficient. |
| Timetable foundation | Required class/section/subject/teacher relational assignment and teacher views are missing/partial. |
| Exams/results foundation | Scheduling, marks entry, result summary, student/parent visibility are missing/partial. |
| Fees foundation | Fee category/structure/assignment/payment lifecycle is missing/partial from School Admin. |
| Notices foundation | Notices with audience targeting are missing from School Admin workflow. |
| Reports foundation | Basic reports with real aggregate queries are not validated as complete. |
| Required plural route groups | `/v1/teachers`, `/v1/students`, `/v1/parents`, `/v1/timetable`, `/v1/exams`, `/v1/fees`, and `/v1/notices` are missing; current app uses singular or alternate groups for several modules. |

## Fake Or Static Data That Must Be Replaced

| Location | Finding |
| --- | --- |
| `apps/web/components/school-admin/school-admin-portal.tsx` | Create forms contain default values such as `Teacher Name`, `Student Name`, `Learning Handbook`, `Grade 1`, and hard-coded dates. These are not dashboard widgets, but they can create fake operational records and should be replaced with empty fields or real selectors. |
| `apps/web/components/layout/app-shell.tsx` | Topbar search placeholder is not backed by real search. It should be disabled, wired, or clearly safe. |
| Other module portals | Several generic portals contain demo-like default form values and require follow-up audit before production use. |

## Route Mismatches

| Area | Finding |
| --- | --- |
| Required `/v1/teachers/*` | Current backend uses `/v1/teacher/*`. |
| Required `/v1/students/*` | Current backend uses `/v1/student/*`. |
| Required `/v1/parents/*` | Current backend uses `/v1/parent/*`. |
| Required `/v1/exams/*` | Current backend uses `/v1/examination/*`. |
| Required `/v1/fees/*` | Current backend uses `/v1/finance/*` and school-admin `fees`. |
| Required `/v1/notices/*` | Current backend uses `/v1/communication/*`. |
| Required `/v1/timetable/*` | Current timetable is nested under `/v1/school-admin/timetable`; no standalone route group found. |

## Database Gaps

| Area | Finding |
| --- | --- |
| Teacher assignments | A dedicated `TeacherSubjectAssignment` relation was not found in the audited schema. |
| Student-parent linkage | A robust parent/student relationship for School Admin-created users was not confirmed. |
| Student class/section linkage | Current `StudentProfile` audited fields include `className` text but no section relation in the visible model portion. |
| Attendance uniqueness | Required uniqueness for student/date/class/section was not confirmed. |
| Fee category/structure | Required fee category and fee structure models were not confirmed in the School Admin foundation. |
| Notices | A dedicated Notice model/workflow was not confirmed; communication announcement models may partially cover this but need validation. |

## UI/UX Gaps

| Area | Finding |
| --- | --- |
| Dashboard layout | Current portal content is serviceable but not yet a polished enterprise ERP dashboard with strong sidebar/topbar/role navigation throughout. |
| Loading states | Spinner panels exist; skeleton loading is missing. |
| Error handling | Error states exist in some components; retry controls are inconsistent. |
| Empty states | Basic empty text exists but is not module-specific or action-oriented. |
| Tables | Tables are usable but lack richer enterprise interactions such as consistent row detail, bulk-safe actions, and relation labels in key workflows. |
| Forms | Some forms lack proper select controls for relational fields and use raw IDs. |
| Destructive actions | Browser `confirm` is used in some places; consistent accessible confirmation dialogs are missing. |
| Accessibility | Labels exist on many inputs, but color contrast, focus states, disabled topbar search behavior, and keyboard interaction need targeted validation. |

## Security / Permission Gaps

| Area | Finding |
| --- | --- |
| Page-level role enforcement | Protected layout only checks that a session exists; individual protected pages need role-specific access checks or clean redirects. |
| Cross-role route access | Backend permission checks should block unauthorized API access, but frontend pages may render before API calls fail. |
| School Admin route scope | Generic routes use token `schoolId`, which is good, but related records supplied by ID must be checked consistently. |
| Super Admin administrator creation | Backend does not explicitly verify `schoolId` exists before creating administrator membership. |
| User status consistency | Admin suspend via DELETE updates membership status but does not deactivate the user; activate does reactivate the user. This can create inconsistent login behavior when a user has multiple memberships. |

## Immediate Implementation Priority

1. Fix Super Admin dashboard metrics for archived schools and administrator counts.
2. Fix administrator list/detail visibility fields and explicit suspend route.
3. Fix school detail API payload and frontend detail view to show campuses, admins, counts, and recent activity.
4. Remove fake/default School Admin form content when starting the School Admin foundation slice.
5. Add targeted tests for Super Admin metrics and visibility regressions.

## Phase 30 Super Admin Slice Update

Completed after the initial audit:

| Area | Update |
| --- | --- |
| Dashboard metrics | `/v1/super-admin/dashboard` now returns real archived school count and total/active/suspended school administrator counts from `SchoolMembership`. The Super Admin dashboard renders these real metrics. |
| School detail visibility | `/v1/super-admin/schools/:id` now returns real school-scoped campuses, assigned school admins, user counts by role, teacher/student/parent/library counts, and recent `AuditLog` activity. The frontend now fetches this detail route instead of showing only the selected list row. |
| Administrator list visibility | `/v1/super-admin/administrators` now returns `createdAt` and `updatedAt`, supports a real `schoolId` filter, and the frontend renders school filtering plus created date. |
| Administrator suspend | Added explicit `POST /v1/super-admin/administrators/:id/suspend`, which suspends the membership, deactivates the user, and writes an audit record. The frontend uses this route. |
| Admin creation integrity | Administrator creation now validates the target school exists and is not archived before creating/updating the user membership. |
| Tests | Added targeted route tests for dashboard metrics, school detail payload, administrator school filter, and explicit suspend behavior. |

Remaining from the initial priority list:

1. Remove fake/default School Admin form content when starting the School Admin foundation slice.
2. Validate Super Admin flows in Preview with a real database session.
3. Continue in the requested implementation order with School Admin login/routing/dashboard, then academic setup.
