# Phase 14 QA Report

Project: School ERP Management System  
Phase: HR & Payroll  
Prepared on: 2026-06-12

## Summary

Phase 14 has been implemented and verified. The HR & Payroll module now supports employees, leaves, payroll records, and salary slips with school-scoped access, CSV exports, audit logging, navigation, and protected web/API routes.

## Verified Workflows

| Workflow | QA Result |
| --- | --- |
| HR dashboard | Counts and payroll aggregate returned successfully for seeded records |
| Employee create/search/export/delete | Verified through live API calls |
| CSV export | Verified with `text/csv; charset=utf-8` response |
| HR Officer access | Seeded HR Officer can access and manage HR records |
| Unauthorized role access | Finance Officer receives 403 on HR API route |
| Seed consistency | Seed script avoids duplicate employee anchor data |

## Quality Notes

| Area | Finding |
| --- | --- |
| Authorization | HR uses the new `hr.manage` permission |
| Tenancy | All HR records require school context |
| Auditability | Create, update, delete, and export actions write audit entries |
| UI consistency | HR follows the established dashboard/table/search/export pattern |
| Payroll | Payroll dashboard exposes the sum of net salary records for quick operational review |

## Issues Found And Fixed

| Issue | Resolution |
| --- | --- |
| Parallel API and web builds hit Node heap memory limits | Reran both builds sequentially with larger Node memory and they passed |

## Known Constraints

| Constraint | Impact |
| --- | --- |
| Salary slips store file URLs but do not generate PDFs yet | PDF generation can be added in a later document/reporting phase |
| Payroll records are not yet connected to bank payout automation | Payout integration can be added in a future finance/payroll hardening phase |
| Browser interaction was not manually clicked in an in-app browser | Production web build and live API checks passed; manual visual click-through remains recommended before final release |

## Approval Gate

Phase 14 is ready for review. Phase 15 must not start until explicit approval is given.

Required approval statement:

```text
Approved to start Phase 15.
```
