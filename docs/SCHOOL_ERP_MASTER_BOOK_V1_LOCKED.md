School ERP Master Book V1 — Locked Execution Edition

1. Project Identity

Project name:
Premium Single-School ERP / School Operating System

Repository:
Existing project only. Do not create a new project.

Current branch:
phase-32-single-school-premium

Project goal:
Build a real production-ready premium school ERP for one school at a time, with future scalability. This system is not a demo and not a generic SaaS shell. It must operate as a real school management platform.

Primary users:

- School Admin / Principal
- Teacher
- Student
- Parent / Guardian
- Finance Officer
- Librarian
- HR / Staff
- Internal Super Admin

Internal-only:
Super Admin and SaaS/campus operations remain internal. The main product experience is school-facing.

2. Technology Rules

Frontend:

- Next.js
- React
- TypeScript
- TailwindCSS

Backend:

- Node.js
- Express.js
- TypeScript
- Prisma
- PostgreSQL

Database:

- PostgreSQL / Neon

API:

- REST API architecture

Authentication:

- JWT-based authentication

Routing rules:

- Backend API prefix must remain "/v1"
- Frontend proxy prefix must remain "/api"
- Never restore "/api/v1"
- Do not hardcode Vercel URLs in frontend or backend application code

Deployment:

- Vercel
- API project root: "apps/api"
- Web project root: "apps/web"

3. Absolute Operating Rules

Do not:

- start a new project
- delete useful existing work
- replace existing architecture without audit
- merge to main unless explicitly instructed
- push unless explicitly instructed
- apply database migrations unless explicitly instructed
- run "npm install"
- run "npm run dev"
- use "prisma db push"
- use "prisma migrate reset"
- create fake production data
- add static demo rows
- add fake dashboard counts
- expose raw Prisma errors to the UI
- skip validation
- skip checklist
- skip implementation report
- skip school scoping
- break existing login
- break "/v1"
- break "/api"

Allowed without asking:

- modify any in-scope application files required for the active phase
- refactor large files to reduce memory/typecheck issues
- add helper/service files
- add docs
- add tests
- improve error handling
- improve UI/UX for the active phase
- add Prisma schema/migration files if required, but do not apply migrations

Must stop and ask before:

- applying migrations
- pushing to GitHub
- merging to main
- production deployment
- destructive database action
- deleting existing code
- changing auth model
- changing route prefixes
- changing deployment architecture
- adding paid/external provider integration

4. Mandatory Phase Process

Every phase must follow this order:

1. Read this Master Book.
2. Read all previous phase reports relevant to the work.
3. Inspect existing code before editing.
4. Create a checklist document before application code changes.
5. Implement only the active phase scope.
6. Update checklist items from Pending to Completed/Deferred/Blocked.
7. Create an implementation report.
8. Create or update manual QA instructions.
9. Run validation.
10. Give final response with:

- checklist path
- report path
- manual QA path if created
- files changed
- routes changed
- schema/migration changes
- validation results
- migration status
- git status
- safe to commit yes/no

11. Stop and ask Project Owner before starting the next phase.

5. Validation Requirements

Run whenever relevant:

Required for frontend changes:

- "npm run typecheck --workspace @school-erp/web"
- "npm run test --workspace @school-erp/web"
- "npm run build --workspace @school-erp/shared"

Required for backend changes:

- "npm run typecheck --workspace @school-erp/api"

Required for schema changes:

- "npx prisma validate --schema=prisma/schema.prisma"
- "npx prisma generate --schema=prisma/schema.prisma"
- "npx prisma migrate status --schema=prisma/schema.prisma"

Low-memory fallback:

- "NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64"
- If API typecheck OOMs, reduce inferred type graphs, split route files, add explicit DTOs, and move heavy logic into service files.

If a very large route file causes TypeScript OOM:

- prefer splitting into service/helper files
- avoid huge inferred Prisma delegate maps
- avoid giant object literal inference
- use DTO types
- use narrow Prisma selects
- only use targeted "// @ts-nocheck" as a temporary documented emergency workaround

6. Database And Migration Rules

Runtime Vercel "DATABASE_URL":

- Neon pooled URL
- contains "-pooler"
- includes "sslmode=require"
- includes safe pool params if needed

Migration command URL:

- Neon direct URL
- must not contain "-pooler"

Never run:

- "prisma db push"
- "prisma migrate reset"

Migration file safety:

- remove BOM from migration.sql
- migration must not drop unrelated tables
- migration must not alter unrelated systems
- migration must be reviewed before apply

If migration fails:

- use "prisma migrate resolve --rolled-back <migration_name>" only after confirming failure state
- then rerun "prisma migrate deploy"
- never manually create production tables unless explicitly instructed

7. Current Known Project State

Completed or partially completed:

- Phase 32B premium school shell
- Phase 32C parent engagement and leave request foundation
- Phase 32D core setup and people foundation
- Phase 32D-Fix school admin core stabilization
- Phase 32E readiness engine and end-to-end setup integration
- Phase 32E-Fix API typecheck memory stabilization

Current known issue pattern:

- Some deployed previews may still show route errors if latest API/web deployments are not synced.
- Parent management and teacher assignment require Phase 32D migration to be applied in the target database.
- Browser QA must be done after migration and redeploy.
- If UI shows "Route not found", check frontend proxy path, backend route, deployment freshness, and Vercel env.

8. Product Modules

Core modules:

1. School Admin Dashboard
2. Academic Setup
3. Classes
4. Sections
5. Subjects/Courses
6. Students
7. Teachers
8. Parents/Guardians
9. Parent-child linking
10. Teacher assignment
11. Attendance
12. Leave Requests
13. Timetable
14. Exams/Results
15. Fees/Finance
16. Library
17. Reading Program
18. LMS/Homework
19. Notices/Messages
20. Reports
21. Settings
22. Role dashboards

Role portals:

- School Admin / Principal
- Teacher
- Student
- Parent / Guardian
- Finance
- Library
- Staff / HR

9. Core Data Dependency Flow

The system must support this end-to-end operational chain:

Academic Year
→ Class
→ Section
→ Subject
→ Teacher
→ Teacher Assignment
→ Student
→ Parent/Guardian
→ Parent-child link
→ Parent portal linked child visibility
→ Parent leave request
→ School Admin leave review
→ Teacher attendance context
→ Attendance summaries
→ Timetable
→ Assignments/LMS
→ Exams/results
→ Fees
→ Reports

No module should pretend to be complete without its required dependencies.

10. Readiness Engine

School Admin dashboard must use real readiness data, not static labels.

Required backend route:

- "GET /v1/school-admin/readiness"

Required frontend path:

- "/api/school-admin/readiness"

Readiness response must include:

- real counts
- flags
- module statuses
- missing dependencies
- next actions

Statuses:

- READY
- SETUP_REQUIRED
- DEPENDENCY_REQUIRED
- COMING_LATER

Readiness checks:

- hasAcademicYear
- hasActiveAcademicYear
- hasClass
- hasSection
- hasSubject
- hasStudent
- hasTeacher
- hasTeacherAssignment
- hasParentGuardian
- hasParentChildLink

Attendance readiness:
active academic year + class + section + student + teacher assignment

Timetable readiness:
active academic year + class + section + subject + teacher assignment

Exams readiness:
active academic year + class + section + subject + student

LMS readiness:
class + subject + teacher assignment

Parent Engagement readiness:
parent-child link

Leave Review readiness:
parent-child link + leave request model

11. UI/UX Rules

All UI must be:

- professional
- premium
- clean
- accessible
- responsive
- school-facing
- role-specific

No SaaS tenant wording in school-facing pages.

Every module must have:

- loading state
- empty state
- error state
- retry action
- validation
- success feedback where relevant
- real data only

Do not show:

- "Workflow not opened in Phase 32B"
- raw "Route not found"
- raw "School Admin resource not found"
- raw Prisma errors
- fake counts
- fake demo rows

12. Security And Permissions

Every route must enforce:

- authentication
- role permission
- schoolId scoping
- no cross-school data access
- safe validation
- safe 403/404/400 errors
- no leaked stack traces

Parent:

- sees linked children only
- cannot select random student
- cannot view unrelated child
- cannot submit leave for unrelated child

School Admin:

- sees only assigned school data
- cannot link cross-school records
- cannot assign teacher to cross-school class/subject/section

Teacher:

- sees assigned class/section/subject data only when teacher scoping is implemented

Student:

- sees own student-scoped data only

13. Master Phase Roadmap

Phase 0 — Current State Audit And Release Sync

Goal:
Stabilize current branch, pending migrations, deployments, env, and current preview errors.

Must:

- inspect git status
- inspect pending migrations
- inspect Vercel-related env assumptions
- confirm Phase 32D migration requirement
- confirm API/web preview sync requirement
- identify current route errors
- do not add features
- do not push
- do not apply migration unless asked

Deliver:

- "docs/phase-0-current-state-audit-checklist.md"
- "docs/phase-0-current-state-audit-report.md"

Stop after report.

Phase 1 — Migration And Deployment Readiness

Goal:
Prepare exact migration and deployment steps.

Must:

- verify migration SQL files
- remove BOM if needed
- provide safe migration commands
- provide deploy order
- provide rollback notes
- do not apply migration unless asked

Deliver:

- migration readiness report
- deployment checklist
- manual QA checklist

Stop and ask Project Owner before applying migration or pushing.

Phase 2 — School Admin Core Setup Completion

Goal:
Make Academic Setup, Classes, Sections, Subjects fully stable.

Must:

- create/edit/list
- active status
- dependency updates
- readiness refresh
- no fake data
- no raw errors

Stop after validation.

Phase 3 — People Foundation Completion

Goal:
Make Students, Teachers, Parents, Parent Links, Teacher Assignments stable.

Must:

- student create/edit
- teacher create/edit
- parent create/edit
- link parent to child
- teacher assignment create/edit
- parent portal child visibility
- no route errors

Stop after validation.

Phase 4 — Parent Engagement And Leave Workflow Completion

Goal:
Complete parent leave and admin review.

Must:

- parent linked child dashboard
- leave request create/list/timeline
- admin review queue
- approve/reject/clarification
- timeline update
- parent privacy rules

Stop after validation.

Phase 5 — Attendance And Leave Integration

Goal:
Open Attendance module.

Must:

- attendance roster by class/section
- mark present/absent/late
- reflect approved leave
- daily attendance summary
- teacher/admin permission
- student/parent attendance visibility

Stop after validation.

Phase 6 — Timetable Foundation

Goal:
Open timetable module.

Must:

- class/section timetable
- teacher assignment dependency
- subject periods
- student/teacher daily view
- conflict prevention if practical

Stop after validation.

Phase 7 — Exams And Results

Goal:
Open exams/results module.

Must:

- exam schedule
- marks entry
- result publishing
- student/parent result visibility
- class summary

Stop after validation.

Phase 8 — Fees And Finance

Goal:
Open fee management.

Must:

- fee structures
- invoices
- student fee status
- parent-friendly explanation
- payment status
- finance dashboard

Stop after validation.

Phase 9 — Library And Reading Program

Goal:
Open library and reading foundation.

Must:

- book catalog
- copies
- issue/return
- overdue queue
- parent reading room preview
- reading request foundation

Stop after validation.

Phase 10 — LMS And Homework

Goal:
Open assignments, learning materials, submissions.

Must:

- teacher assignment creation
- student submission
- parent visibility
- LMS material listing
- status tracking

Stop after validation.

Phase 11 — Notices And Messaging

Goal:
Open communication module.

Must:

- school notices
- audience targeting
- parent acknowledgement
- teacher positive notes
- parent messages/concerns

Stop after validation.

Phase 12 — Reports And Principal Analytics

Goal:
Open reports.

Must:

- attendance reports
- finance reports
- exam reports
- library reports
- principal daily brief
- export only if safe

Stop after validation.

Phase 13 — Role Portal Completion

Goal:
Polish all role dashboards.

Must:

- School Admin
- Teacher
- Student
- Parent
- Finance
- Library
- Staff

Each portal must show real scoped data only.

Stop after validation.

Phase 14 — Accessibility, UX Polish, Security Hardening

Goal:
Production hardening.

Must:

- keyboard navigation
- screen reader compatibility
- high contrast
- large touch targets
- clear errors
- auth hardening
- input validation
- rate limiting if already supported
- no secret leaks

Stop after validation.

Phase 15 — Final QA, GitHub, Preview, Production Readiness

Goal:
Final release process.

Must:

- full validation
- manual QA
- browser QA
- migration status
- env check
- build check
- git status
- commit
- push only after Project Owner approval
- deploy preview
- verify preview
- production only after approval

Stop before production deployment.

14. Manual QA Master Flow

School Admin:

1. Login as School Admin.
2. Open "/school-admin".
3. Confirm readiness loads.
4. Create active academic year.
5. Create class.
6. Create section.
7. Create subject.
8. Create teacher.
9. Create teacher assignment.
10. Create student.
11. Create parent.
12. Link parent to student.
13. Confirm dashboard readiness updates.

Parent:

1. Login as parent.
2. Confirm linked child appears.
3. Submit leave request.
4. View leave timeline.

School Admin:

1. Open leave review.
2. Approve/reject leave.
3. Confirm parent timeline update.

Teacher:

1. Login as teacher.
2. Confirm assigned data appears only after assignment.

Student:

1. Login as student.
2. Confirm student-scoped data.

Failure checks:

- no raw route errors
- no old placeholders
- no fake data
- no cross-school leaks
- parent cannot see unrelated child
- teacher cannot see unrelated class
- locked modules remain gated until dependencies are complete

15. Final Definition Of Done

The project is not complete until:

- all role logins work
- all core modules work with real data
- all dependencies are linked
- all dashboards use real scoped data
- all school-admin workflows are usable
- parent-child linking works
- teacher assignment works
- leave request and review work
- attendance works
- timetable works
- exams/results work
- fees work
- library works
- LMS works
- notices work
- reports work
- migrations are applied
- preview is verified
- no raw errors appear
- no fake data appears
- accessibility basics are satisfied
- validation passes
- manual QA passes
- GitHub push is approved
- production deploy is approved

16. Codex Response Contract

Every Codex final response must include:

1. Phase name
2. Checklist path
3. Report path
4. Manual QA path if created
5. What was inspected
6. What was changed
7. Routes added/changed
8. Frontend files changed
9. Backend files changed
10. Schema/migration changes
11. Permissions/security notes
12. Validation results
13. Migration status
14. Browser QA status
15. Unverified items
16. Files changed
17. Git status
18. Safe to commit yes/no
19. Whether next phase can start
20. Exact next recommended phase

End of Master Book V1.
