# Phase 3-Fix-2 Teacher Assignment Class Dropdown Manual QA

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Browser QA Flow

1. Login as School Admin.
2. Open `/school-admin`.
3. Open Teachers.
4. Look at the Teacher Assignment form.
5. Confirm helper counts show:
   - Classes loaded > 0
   - Sections loaded > 0
   - Subjects loaded > 0
   - Teachers loaded > 0
6. Confirm Class dropdown shows `Select class`.
7. Open Class dropdown.
8. Confirm Grade 1 or other real class names appear.
9. Select Grade 1.
10. Confirm Section dropdown still has `All sections`.
11. Confirm Grade 1 / B appears under sections if that section exists.
12. Select teacher.
13. Select subject.
14. Save assignment.
15. Confirm assignment appears in the table with teacher, class, section, subject, and status.
16. Refresh page.
17. Confirm class dropdown still works.
18. Login as teacher.
19. Confirm assigned class count updates.

## Failure Checks

- No blank class dropdown when classes or section-linked classes exist.
- No fake class options.
- No raw route error.
- No save without class, teacher, and subject.
- No cross-school data appears.
- Attendance, timetable, exams, fees, library, LMS, notices, reports, and settings remain gated.
