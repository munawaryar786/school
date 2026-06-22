# Phase 3 People Foundation Manual QA

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## School Admin Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Classes.
4. Run `Create missing 1-12` if classes are not already present.
5. Open Subjects.
6. Run `Create common subjects` if subjects are not already present.
7. Open Students.
8. Create a student assigned to Grade 1.
9. Confirm the student appears in the student list with admission number and class.
10. Open Teachers.
11. Create a teacher with full name, email, login enabled, and a temporary password.
12. Confirm the teacher list shows login as enabled.
13. In Teacher Assignments, select the created teacher.
14. Confirm the Class dropdown shows real classes, including Grade 1.
15. Select Grade 1 and a subject.
16. Leave Section as `All sections` or select a real section if one exists.
17. Save the teacher assignment.
18. Confirm the assignment table shows teacher, class, section, subject, and status.
19. Open Parents/Guardians.
20. Create a parent with full name, email, login enabled, and a temporary password.
21. Link the parent to the created student.
22. Confirm the parent list shows linked child count/details.
23. Refresh the dashboard and confirm readiness/counts update.

## Teacher Flow

1. Logout from School Admin.
2. Login as the newly created teacher using the temporary password.
3. Open the teacher portal.
4. Confirm the portal opens successfully.
5. Confirm assigned class count reflects the teacher assignment when the teacher email matches the teacher profile email.
6. Confirm unrelated school data is not shown.

## Parent Flow

1. Logout from teacher.
2. Login as the newly created parent using the temporary password.
3. Open the parent portal.
4. Confirm the linked child appears.
5. Submit a leave request for the linked child.
6. Confirm the leave request appears in the parent timeline.

## School Admin Leave Review Smoke Check

1. Login as School Admin again.
2. Open `/school-admin`.
3. Confirm the parent leave request appears in the review queue.
4. Approve, reject, or request clarification.
5. Login as parent again.
6. Confirm the leave request timeline/status updates.

## Failure Checks

- Teacher assignment rejects missing class or subject.
- Teacher create with login enabled requires email and temporary password for a new account.
- Parent create with login enabled requires email and temporary password for a new account.
- Parent cannot see unrelated child.
- Teacher cannot see unrelated school data.
- Parent-child linking rejects cross-school records.
- Teacher assignment rejects cross-school teacher/class/section/subject records.
- No raw `Route not found` appears.
- No raw `School Admin resource not found` appears.
- No fake data or static demo rows appear.
- Attendance, timetable, exams, fees, library, LMS, notices, reports, and settings remain gated.
