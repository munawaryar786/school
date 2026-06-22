# Phase 2 School Admin Core Setup Completion Checklist

Date: 2026-06-22
Branch: `phase-32-single-school-premium`

## Scope

Complete School Admin core setup only: Academic Years, Classes/Grades, Sections, Subjects/Courses, setup guidance, idempotent quick setup for standard classes, optional common subjects, readiness refresh, and teacher-assignment selector data flow. Do not start Phase 3 or implement attendance, timetable, exams, fees, library, LMS, notices, reports, or settings.

## Checklist

- Completed: Read locked Master Book.
- Completed: Read Phase 0 current-state audit report.
- Completed: Read Phase 1 migration/deployment readiness report.
- Completed: Inspect School Admin backend routes.
- Completed: Inspect School Admin readiness service.
- Completed: Inspect School Admin portal frontend.
- Completed: Inspect Prisma schema for core setup models.
- Completed: Audit academic year API response shape and frontend mapping.
- Completed: Audit class API response shape and frontend selector mapping.
- Completed: Audit section API response shape and frontend selector mapping.
- Completed: Audit subject API response shape and frontend selector mapping.
- Completed: Identify root cause of empty teacher-assignment class dropdown.
- Completed: Stabilize academic year active/current behavior if needed.
- Completed: Add idempotent standard classes 1-12 setup if safe.
- Completed: Stabilize section class linkage and selector guidance.
- Completed: Stabilize subject setup and selector guidance.
- Completed: Add common subjects setup if safe.
- Completed: Add or improve ordered setup wizard/guidance.
- Completed: Ensure readiness refresh after core setup mutations.
- Blocked: API typecheck cannot complete under Project Owner's less-than-700 MB cap; `640` and `688` MB both OOM.
- Completed: Other required validation commands run under low-memory cap where applicable.
- Completed: Create implementation report.
- Completed: Create manual QA document.
- Completed: Stop before Phase 3.
