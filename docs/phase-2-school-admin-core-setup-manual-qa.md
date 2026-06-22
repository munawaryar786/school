# Phase 2 School Admin Core Setup Manual QA

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Preconditions

- Latest API and web code are deployed together.
- Required migrations for the target database have been applied where needed.
- Login works for a School Admin with `SCHOOL_OPERATIONS_MANAGE`.
- Use real school data only.

## School Admin Core Setup Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Confirm the setup wizard loads real counts.
4. Open `Academic Setup`.
5. Create an academic year with status `ACTIVE`.
6. Create a second academic year as `ACTIVE`.
7. Confirm the previously active academic year is no longer active.
8. Edit an academic year and confirm the table updates.
9. Open `Classes`.
10. Click `Create missing 1-12`.
11. Confirm the success message shows created and already-existing class counts.
12. Click `Create missing 1-12` again.
13. Confirm the second run creates zero duplicates and reports already-existing classes.
14. Manually create or edit a class.
15. Open `Sections`.
16. Confirm the class dropdown shows class name, code, and status.
17. Create a section linked to a class.
18. Edit the section and confirm class name appears in the table.
19. Open `Subjects/Courses`.
20. Click `Create common subjects`.
21. Confirm the success message shows created and already-existing subject counts.
22. Click `Create common subjects` again.
23. Confirm the second run creates zero duplicates.
24. Manually create or edit a subject.
25. Open `Teachers`.
26. Confirm the Teacher Assignment class dropdown shows the real classes.
27. Confirm the subject dropdown shows the real subjects.
28. If no sections exist, confirm section guidance says section-specific assignment needs sections and `All sections` is available.
29. Refresh dashboard.
30. Confirm readiness counts update for active academic year, classes, sections, and subjects.

## Failure Checks

- No raw `Route not found`.
- No raw `School Admin resource not found`.
- No raw Prisma error.
- No fake records or fake counts.
- Class quick setup does not duplicate existing classes.
- Common subject quick setup does not duplicate existing subjects.
- Sections cannot be linked to classes outside the school.
- Teacher assignment selectors show only school-scoped teachers/classes/sections/subjects.
- Attendance, timetable, exams, fees, library, LMS, notices, reports, and settings remain gated.
