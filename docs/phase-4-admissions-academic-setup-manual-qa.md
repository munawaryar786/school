# Phase 4 Admissions And Academic Setup Manual QA

## School Admin Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Confirm dashboard readiness loads without raw route errors.
4. Open Academic Setup.
5. Create or edit an academic year.
6. Activate one academic year and confirm it is shown as active.
7. Open Classes.
8. Run Create missing 1-12.
9. Confirm Grade 1 through Grade 12 exist.
10. Open Sections.
11. Create section `A` linked to Grade 1.
12. Open Subjects.
13. Run Create common subjects.
14. Open Admissions.
15. Create a new admission applicant for Grade 1.
16. Move the admission to `UNDER_REVIEW`.
17. Approve the admission.
18. Convert the approved admission to a student.
19. Open Students.
20. Confirm the converted student appears with admission number, guardian name, guardian phone, class, and active status.
21. Open Parents.
22. Link a parent to the converted student.
23. Open Teachers.
24. Assign a teacher to the converted student's class and subject.
25. Return to Dashboard.
26. Confirm readiness/counts update for admissions and students.

## Failure Checks

1. Confirm a rejected admission cannot be converted.
2. Confirm the same admission cannot be converted twice.
3. Confirm admission creation requires a real class.
4. Confirm section creation still requires a real class.
5. Confirm student creation still requires admission number, student name, guardian name, guardian phone, and class.
6. Confirm no cross-school admission, class, or student data is visible.
7. Confirm no fake data or static demo rows are shown.
8. Confirm no raw `Route not found`, `School Admin resource not found`, or Prisma errors appear.
9. Confirm locked modules remain gated.

## Notes

- Current schema stores converted student class as `StudentProfile.className`; section-specific student assignment is not available until the schema supports it.
- Admission applicant fields are limited to the existing `AdmissionApplication` schema.
