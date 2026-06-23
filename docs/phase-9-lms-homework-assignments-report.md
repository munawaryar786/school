# Phase 9 - LMS / Homework And Assignments Foundation Report

## Summary
Phase 9 opens the LMS / Homework foundation using existing school-scoped models. No schema changes or migrations were required. Teachers can create homework and learning materials for assigned class/subject pairs, School Admin can monitor records, and Parent/Student portals can see scoped homework and materials.

## Homework Model Behavior
- Existing `TeacherAssignment` is used for homework/assignments.
- Supported fields include schoolId, teacherId, title, className, subject, dueDate, maxMarks, status, and timestamps.
- Homework records are filtered by school and role scope.

## LMS Model Behavior
- Existing `TeacherMaterial` is used for learning materials.
- Supported fields include schoolId, teacherId, title, className, subject, resourceType, url, status, and timestamps.
- Existing full LMS catalog models remain untouched for future LMS expansion.

## Teacher Homework/LMS Behavior
- Teacher portal now has a Homework / LMS panel.
- Teacher assignment context supplies real assigned class/subject pairs.
- Teacher can create homework through `/api/teacher/homework`.
- Teacher can create learning materials through `/api/teacher/lms`.
- Backend rejects creation when the teacher is not assigned to the selected class/subject.
- If no assignment exists, UI shows: “Ask School Admin to assign class and subject before creating homework.”

## School Admin Monitoring Behavior
- School Admin can open LMS from `/school-admin`.
- School Admin can monitor homework records and learning material records.
- Summary cards show real homework/material counts.
- School Admin monitoring is read-only in this phase.

## Parent Visibility
- Parent `/api/parent/homework` returns published non-draft homework for linked child classes only.
- Parent `/api/parent/lms` returns published learning materials for linked child classes only.
- Parent portal shows selected-child homework and learning materials.

## Student Visibility
- Student `/api/student/homework` returns own class homework.
- Student `/api/student/lms` returns own class learning materials.
- Student dashboard shows own homework/materials with empty states.

## Submission Behavior
- Existing `StudentAssignmentSubmission` model exists and remains available through existing student submission resource patterns.
- A full homework submission workflow was not expanded in this phase; no fake submissions were added.

## Readiness Updates
- Readiness now counts `homeworkRecords` from `TeacherAssignment`.
- Readiness now counts `lmsMaterials` from `TeacherMaterial`.
- Flags added: `hasHomework`, `hasLmsMaterial`.
- LMS readiness now requires class, subject, teacher assignment, and at least homework or learning material.

## Backend Routes Changed
- GET /v1/teacher/homework
- POST /v1/teacher/homework
- PATCH /v1/teacher/homework/:id
- GET /v1/teacher/lms
- POST /v1/teacher/lms
- PATCH /v1/teacher/lms/:id
- GET /v1/school-admin/homework
- GET /v1/school-admin/lms
- GET /v1/school-admin/lms/summary
- GET /v1/parent/homework
- GET /v1/parent/lms
- GET /v1/student/homework
- GET /v1/student/lms

## Frontend Files Changed
- School Admin portal: LMS monitoring workspace and setup coach/readiness updates.
- Teacher role dashboard: homework/material creation panel.
- Student role dashboard: homework/material visibility panel.
- Parent portal: linked-child homework and learning material panels.

## Schema / Migration Changes
No Prisma schema change was required. No migration was added or applied.

## Permissions And Security Notes
- Teacher homework/LMS writes require existing teacher auth and assigned class/subject validation.
- School Admin monitoring routes remain school-scoped.
- Parent routes are scoped to linked child classes.
- Student routes are scoped to the resolved student profile class.
- Browser calls use `/api`, not direct `/v1`.

## Validation Results
- PASS: npx.cmd prisma validate --schema=prisma/schema.prisma
- PASS: npx.cmd prisma generate --schema=prisma/schema.prisma
- PASS: cmd /c "set NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/api"
- PASS: cmd /c "set NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64&& npm.cmd run typecheck --workspace @school-erp/web"
- PASS: npm.cmd run test --workspace @school-erp/web
- PASS: npm.cmd run build --workspace @school-erp/shared

## Browser QA Status
Not run in browser. Manual QA steps are documented in docs/phase-9-lms-homework-assignments-manual-qa.md.

## Unverified Items
- Browser creation of homework/materials must be verified after redeploy.
- Student submission UX is intentionally not expanded beyond existing model/resource support.