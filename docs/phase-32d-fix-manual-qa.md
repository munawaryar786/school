# Phase 32D-Fix Manual QA Script

Date: 2026-06-21
Branch: `phase-32-single-school-premium`

## Main Browser Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Academic Setup and create an academic year.
4. Edit the academic year and verify status can be changed.
5. Open Classes and create a class.
6. Edit the class and verify status can be changed.
7. Open Sections and create a section linked to the class.
8. Edit the section and verify class/capacity/status remain valid.
9. Open Subjects/Courses and create a subject.
10. Edit the subject.
11. Open Students and create a student profile with admission number and class.
12. Edit the student profile.
13. Open Teachers and create a teacher profile.
14. Create a teacher assignment for teacher, class, optional section, and subject.
15. Edit the teacher assignment.
16. Open Parents/Guardians and create a parent/guardian.
17. Link the parent/guardian to the student.
18. Toggle parent login enabled/disabled and verify the status changes.
19. Login as parent.
20. Verify the linked child appears in the parent portal.
21. Submit a leave request for the linked child.
22. Login as School Admin.
23. Verify the leave request appears in the review queue.
24. Approve or reject the leave request.
25. Login as parent again.
26. Verify the leave request timeline/status updates.

## Failure Checks

1. Parent cannot see an unrelated child.
2. School Admin cannot link a parent to a student from another school.
3. School Admin cannot create a section with a class from another school.
4. School Admin cannot create a teacher assignment with teacher/class/section/subject from another school.
5. Parent-child linking with no students shows: `Create student profiles before linking parents.`
6. Parents module empty state shows: `No parent or guardian accounts have been created yet.`
7. Locked modules remain locked/dependency-gated:
   - Attendance
   - Timetable
   - Exams/Results
   - Fees/Finance
   - Library
   - Reading Program
   - LMS
   - Notices
   - Reports
   - Settings
8. No School Admin UI text says: `Workflow not opened in Phase 32B`.
9. Parent API deployment mismatch does not show raw `School Admin resource not found.` in the UI.
10. Parent link deployment mismatch does not show raw `Route not found.` in the UI.

## Expected API Paths

| Action | Frontend path | Backend path |
| --- | --- | --- |
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
| Parent leave submit | `/api/parent/children/:studentId/leave-requests` | `/v1/parent/children/:studentId/leave-requests` |
| School Admin leave review | `/api/school-admin/leave-requests/:id/review` | `/v1/school-admin/leave-requests/:id/review` |
