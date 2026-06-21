# Phase 32E Manual QA

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## School Admin Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Confirm dashboard readiness loads without raw route/resource errors.
4. Create an active academic year.
5. Refresh dashboard and confirm Academic Setup readiness updates.
6. Create a class.
7. Create a section linked to the class.
8. Create a subject.
9. Create a student linked to the class. If section is not supported by schema, confirm class assignment is saved.
10. Create a teacher.
11. Create a teacher assignment using teacher, class, optional section, and subject.
12. Edit the teacher assignment.
13. Create a parent/guardian.
14. Link parent/guardian to the student.
15. Toggle parent login enabled/disabled.
16. Refresh dashboard and confirm counts/readiness update.
17. Confirm Attendance shows dependency/ready state based on active year, class, section, student, and teacher assignment.
18. Confirm Timetable shows dependency/ready state based on active year, class, section, subject, and teacher assignment.
19. Confirm LMS shows dependency/ready state based on class, subject, and teacher assignment.

## Parent Flow

20. Login as linked parent.
21. Confirm linked child appears in Parent Engagement Hub.
22. Submit a leave request for the linked child.
23. Login as School Admin.
24. Verify leave request appears in the review queue.
25. Approve, reject, or request clarification.
26. Login as parent again.
27. Confirm leave request timeline/status updates.

## Failure Checks

1. No old Phase 32B placeholder text appears.
2. No raw `Route not found` appears in School Admin UI.
3. No raw `School Admin resource not found` appears in School Admin UI.
4. No fake data, demo rows, or fake counts appear.
5. Cross-school parent-child linking is rejected.
6. Parent cannot see unrelated child.
7. Teacher assignment rejects cross-school teacher/class/section/subject IDs.
8. Locked modules remain gated until real dependencies are complete.
9. If Phase 32D migration is not applied, parent-child link and teacher assignment mutations show migration-required guidance instead of raw Prisma errors.
10. Readiness refreshes after create/edit/link actions.

## Expected API Paths

| Action | Frontend path | Backend path |
| --- | --- | --- |
| Readiness | `/api/school-admin/readiness` | `/v1/school-admin/readiness` |
| Academic years | `/api/school-admin/academic-years` | `/v1/school-admin/academic-years` |
| Classes | `/api/school-admin/classes` | `/v1/school-admin/classes` |
| Sections | `/api/school-admin/sections` | `/v1/school-admin/sections` |
| Subjects | `/api/school-admin/subjects` | `/v1/school-admin/subjects` |
| Students | `/api/school-admin/students` | `/v1/school-admin/students` |
| Teachers | `/api/school-admin/teachers` | `/v1/school-admin/teachers` |
| Parents | `/api/school-admin/parents` | `/v1/school-admin/parents` |
| Parent-child link | `/api/school-admin/parents/:parentId/link-child` | `/v1/school-admin/parents/:parentId/link-child` |
| Parent login status | `/api/school-admin/parents/:parentId/login-status` | `/v1/school-admin/parents/:parentId/login-status` |
| Teacher assignments | `/api/school-admin/teacher-assignments` | `/v1/school-admin/teacher-assignments` |
| Parent children | `/api/parent/children` | `/v1/parent/children` |
| Parent child summary | `/api/parent/children/:studentId/summary` | `/v1/parent/children/:studentId/summary` |
| Parent leave requests | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` |
| School Admin leave review | `/api/school-admin/leave-requests/:id/review` | `/v1/school-admin/leave-requests/:id/review` |
