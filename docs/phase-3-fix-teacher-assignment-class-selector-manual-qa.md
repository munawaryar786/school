# Phase 3-Fix Teacher Assignment Class Selector Manual QA

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Browser QA Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Classes.
4. Run `Create missing 1-12`.
5. Confirm Grade 1 through Grade 12 exist.
6. Open Sections.
7. Confirm at least one section linked to Grade 1 exists.
8. Open Subjects.
9. Confirm common subjects exist.
10. Open Teachers.
11. Find the Teacher Assignment form.
12. Confirm the Class dropdown shows `Select class` when no class is selected.
13. Open the Class dropdown and confirm Grade 1 through Grade 12 appear.
14. Select Grade 1.
15. Confirm Section dropdown still shows `All sections`.
16. Confirm section labels include class and section, for example `Grade 1 / B - Active`.
17. Select a teacher.
18. Select a subject.
19. Save the assignment.
20. Confirm the assignment appears in the records table with teacher, class, section, subject, and status.
21. Login as the assigned teacher.
22. Confirm the teacher portal assigned class count updates after deployment and refresh.

## Failure Checks

- If no classes exist, the UI shows `Create classes before assigning teachers.`
- If no subjects exist, the UI shows `Create subjects before assigning teachers.`
- Saving without class is blocked by the required select.
- Saving without teacher is blocked by the required select.
- Saving without subject is blocked by the required select.
- No raw `Route not found` appears.
- No raw `School Admin resource not found` appears.
- No fake Grade/Class options appear.
- Attendance, timetable, exams, fees, library, LMS, notices, reports, and settings remain gated.
