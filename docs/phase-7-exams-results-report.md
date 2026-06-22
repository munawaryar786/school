# Phase 7 Exams And Results Foundation Report

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Phase 7 opened Exams and Results foundation only. Fees, Library, LMS, Notices, Reports, and Settings were not started. No push, merge, deployment, dev server, npm install, `db push`, or migrate reset was run.

## What Was Inspected

- `docs/SCHOOL_ERP_MASTER_BOOK_V1_LOCKED.md`
- `docs/phase-6-timetable-foundation-report.md`
- `docs/phase-5-attendance-management-report.md`
- `prisma/schema.prisma`
- School Admin, Teacher, Parent, and Student API routes
- School Admin, Teacher, and Parent/frontend role components

## Exam Model Behavior

Existing models were used. No migration was required.

- School Admin exam schedules use `ExaminationSchedule`.
- Teacher-entered marks/results use `TeacherMark`.
- Parent and Student result visibility use `TeacherMark` through existing scoped result resources.

Supported `ExaminationSchedule` fields include `schoolId`, `title`, `className`, `subject`, `examDate`, `maxMarks`, `status`, and timestamps. The current schema does not store exam start time, end time, or passing marks. The UI validates passing marks but documents that stored passing marks need a later schema expansion.

## School Admin Exam Behavior

School Admin can now:

- list exam schedules
- create exam schedules
- edit exam schedules
- select real classes and subjects
- validate exam name, class, subject, date, and total marks
- reject passing marks greater than total marks
- view real result records entered by teachers
- view basic result counts and average score

Routes added/stabilized:

- `GET /v1/school-admin/exams`
- `POST /v1/school-admin/exams`
- `PATCH /v1/school-admin/exams/:id`
- `GET /v1/school-admin/results`
- `GET /v1/school-admin/results/summary`

Browser calls use `/api/school-admin/exams`, `/api/school-admin/results`, and `/api/school-admin/results/summary`.

## Teacher Marks Entry Behavior

Teacher portal now includes an Exam Marks Entry panel.

Teacher routes added:

- `GET /v1/teacher/exams`
- `GET /v1/teacher/exams/:id/students`
- `POST /v1/teacher/results/marks`

Teachers only see exams whose class and subject match their active `TeacherSubjectAssignment`. Marks can be saved for real students in that exam class. Duplicate marks for the same teacher/student/class/subject/exam are updated rather than duplicated.

## Parent Result Visibility

Parent portal now loads `/api/parent/results` and shows result cards for the selected linked child only. Parent scoping remains linked-child based.

## Student Result Visibility

Student dashboard now includes `My Results` using `/api/student/results?pageSize=20`. Student scoping remains based on the existing student profile scope.

## Readiness Updates

Readiness now includes:

- `counts.examRecords` from `ExaminationSchedule`
- `counts.resultRecords` from `TeacherMark`
- `flags.hasExam`
- `flags.hasResult`
- setup coach actions: `Create exam schedules` and `Enter marks`

## Backend Files Changed

- `apps/api/src/modules/school-admin/school-admin.routes.ts`
- `apps/api/src/modules/school-admin/school-admin.readiness.ts`
- `apps/api/src/modules/teacher/teacher.routes.ts`

## Frontend Files Changed

- `apps/web/components/school-admin/school-admin-portal.tsx`
- `apps/web/components/dashboard/role-dashboard-foundation.tsx`
- `apps/web/components/parent/parent-portal.tsx`

## Schema And Migration Changes

No schema changes were made. No migration was created or applied.

## Permissions And Security Notes

- School Admin routes use existing School Admin auth and school scope.
- Teacher routes use existing Teacher portal auth and active teacher assignment scope.
- Parent result visibility uses linked-child scope.
- Student result visibility uses student profile scope.
- No fake exam or result rows were added.
- No direct `/v1` browser calls were added.

## Validation Results

- Passed: `npx.cmd prisma validate --schema=prisma/schema.prisma`
- Passed: `npx.cmd prisma generate --schema=prisma/schema.prisma`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"`
- Passed: `cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"`
- Passed: `npm.cmd run test --workspace @school-erp/web`
- Passed: `npm.cmd run build --workspace @school-erp/shared`

## Browser QA Status

Not run because dev server and deployment were explicitly disallowed. Manual QA is documented separately.

## Unverified Items

- Browser create/edit exam schedule flow must be verified after redeploy.
- Teacher marks entry must be verified with real teacher assignment and student records.
- Stored passing marks, exam start time, and exam end time require a later schema expansion if they must persist.

## Safe To Commit

Yes, after Project Owner review. Do not push or deploy without approval.