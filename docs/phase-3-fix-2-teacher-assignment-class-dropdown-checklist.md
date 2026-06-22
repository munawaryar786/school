# Phase 3-Fix-2 Teacher Assignment Class Dropdown Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Definitively fix the Teacher Assignment class dropdown using real database records only. Do not start Phase 4 and do not implement attendance, timetable, exams, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 3-Fix report.
- Completed: Read Phase 3 People Foundation report.
- Completed: Read Phase 2 Core Setup report.
- Completed: Inspect School Admin portal Teacher Assignment implementation.
- Completed: Inspect School Admin API route response shapes.
- Completed: Inspect Prisma class, section, and teacher assignment schema.
- Completed: Stop relying on generic form assumptions for teacher assignment.
- Completed: Add dedicated TeacherAssignmentForm with explicit local state.
- Completed: Normalize class options from direct class rows.
- Completed: Normalize class options from section class relations.
- Completed: Support likely class relation keys and field names.
- Completed: Dedupe class options by real class id only.
- Completed: Add visible data-count setup hint.
- Completed: Keep teacherId/classId/subjectId required and sectionId optional.
- Completed: Infer classId from selected section when safe.
- Completed: Filter section options by selected class.
- Completed: Preserve assignment table refresh and readiness refresh.
- Completed: Run validation.
- Completed: Create implementation report.
- Completed: Create manual QA document.
- Completed: Stop before Phase 4.

## Fix Notes

- Added a dedicated `TeacherAssignmentForm` with explicit `teacherId`, `classId`, `sectionId`, `subjectId`, and `status` state.
- Class options now come from direct class rows and real section class relation fallback rows.
- Section selection can safely infer `classId` when the section has a class id and the normalized class options include it.
- The setup hint shows real loaded counts for classes, sections, subjects, and teachers.
