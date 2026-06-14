# Phase 6 QA Report

Project: School ERP Management System  
Phase: Student Portal  
Prepared on: 2026-06-12

## Summary

Phase 6 has been implemented and verified. The Student Portal now gives students scoped access to academic and finance information, supports assignment submissions, online exam attempts, fee payment records, CSV exports, and role-based API protection.

## Verified Workflows

| Workflow | QA Result |
| --- | --- |
| Student dashboard | Counts and student profile returned successfully |
| Assignment submission create/search/export/delete | Verified through live API calls |
| CSV export | Verified with `text/csv; charset=utf-8` response |
| Student ownership scope | Student-owned resources use `schoolId + studentId` |
| Class/student visibility scope | Published assignments, materials, timetable, exams, attendance, fees, and results are scoped by school plus class or student identity |
| Unauthorized role access | Teacher receives 403 on Student API route |
| Seed consistency | Seed script avoids duplicate student certificate anchor data |

## Quality Notes

| Area | Finding |
| --- | --- |
| Authorization | Student Portal uses the new `student.portal.access` permission |
| Tenancy | All Student Portal records require school context |
| Auditability | Create, delete, and export actions write audit entries |
| UI consistency | Portal follows the established dashboard/table/search/export pattern |
| Read/write boundaries | Student write actions are limited to submissions, exam attempts, and payments |

## Known Constraints

| Constraint | Impact |
| --- | --- |
| Student profile is matched from the demo user name for this phase | Keeps Phase 6 compatible with the existing Phase 4 lightweight profile model; a direct `userId` link can be added during deeper student lifecycle phases |
| Download links are represented as URL fields | Real file storage/download signing should be introduced in later document/certificate phases |
| Online exam taking is represented by attempt submission records | Full timed question rendering and grading engine belongs to the later Examination/LMS phases |
| Browser interaction was not manually clicked in an in-app browser | Production web build and live API checks passed; manual visual click-through remains recommended before final release |

## Approval Gate

Phase 6 is ready for review. Phase 7 must not start until explicit approval is given.

Required approval statement:

```text
Approved to start Phase 7.
```
