# Phase 7 QA Report

Project: School ERP Management System  
Phase: Parent Portal  
Prepared on: 2026-06-12

## Summary

Phase 7 has been implemented and verified. The Parent Portal now gives parents scoped access to child records, calculated performance analytics, homework, fee status, parent-owned payments, and bidirectional communication records.

## Verified Workflows

| Workflow | QA Result |
| --- | --- |
| Parent dashboard | Child count and performance counts returned successfully |
| Communication create/search/export/delete | Verified through live API calls |
| CSV export | Verified with `text/csv; charset=utf-8` response |
| Parent ownership scope | Parent-owned resources use `schoolId + parentId` |
| Child visibility scope | Child data is resolved by active school and guardian name |
| Unauthorized role access | Student receives 403 on Parent API route |
| Seed consistency | Seed script avoids duplicate parent payment anchor data |

## Quality Notes

| Area | Finding |
| --- | --- |
| Authorization | Parent Portal uses the new `parent.portal.access` permission |
| Tenancy | All Parent Portal records require school context |
| Auditability | Create, delete, and export actions write audit entries |
| Analytics | Performance is calculated from attendance, marks, homework, fees, and payments |
| UI consistency | Portal follows the established dashboard/table/search/export pattern |
| Read/write boundaries | Parent write actions are limited to payments and communication |

## Known Constraints

| Constraint | Impact |
| --- | --- |
| Parent-child linking uses `guardianName` in this phase | Keeps Phase 7 compatible with the existing lightweight StudentProfile model; a normalized guardian-child relation should be added in later lifecycle phases |
| Fee records are school-level in the current schema | Parent fee visibility is scoped to the school and paired with parent-owned payment records |
| Performance analytics are calculated on request | This is appropriate for current data volume; historical analytics snapshots can be introduced in reporting phases |
| Browser interaction was not manually clicked in an in-app browser | Production web build and live API checks passed; manual visual click-through remains recommended before final release |

## Approval Gate

Phase 7 is ready for review. Phase 8 must not start until explicit approval is given.

Required approval statement:

```text
Approved to start Phase 8.
```
