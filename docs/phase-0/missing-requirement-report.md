# Missing Requirement Report

Project: School ERP Management System  
Phase: 0 - Requirements Verification

This report does not remove or weaken any submitted requirement. It identifies details that must be resolved before or during the relevant phase to make the system production-grade.

## High Priority Clarifications

| ID | Missing or Ambiguous Detail | Impact | Recommended Resolution Phase |
| --- | --- | --- | --- |
| MR-001 | Target countries, education boards, grading systems, academic calendars, and localization rules are not specified. | Affects academic years, exams, report cards, attendance, finance, certificates, and legal text. | Phase 1 |
| MR-002 | Multi-school tenancy model is required but not detailed: single database vs shared schema, tenant scoping, domain/subdomain strategy, and tenant provisioning rules. | Affects every database table, API, RBAC rule, and report. | Phase 1 |
| MR-003 | Role and permission granularity is not specified beyond major personas. | Blocks enforceable RBAC matrix and secure navigation. | Phase 1 |
| MR-004 | Authentication details are incomplete: JWT refresh flow, password policy, session invalidation, device tracking, and 2FA enrollment rules. | Affects security, UX, and compliance. | Phase 1 |
| MR-005 | Payment provider, currency, tax, refund, receipt, and reconciliation rules are not specified. | Blocks production-ready fee payments and finance modules. | Phase 1/13 |
| MR-006 | Notification providers for SMS, email, and push are not specified. | Blocks reliable communication and alerts. | Phase 1/16 |
| MR-007 | S3-compatible provider, bucket policy, file size limits, antivirus scanning, signed URL strategy, and retention rules are not specified. | Blocks secure uploads, videos, documents, backups, CMS media, and certificates. | Phase 1 |
| MR-008 | Reporting requirements do not define report layouts, filters, date ranges, export formats, branding, or retention. | Affects PDF/Excel implementation and QA expectations. | Phase 1/17 |
| MR-009 | Backup and restore scope is not specified: full tenant restore, full platform restore, point-in-time recovery, or file/database backup coordination. | Affects Super Admin Portal and security hardening. | Phase 1/3/24 |
| MR-010 | Mobile API authentication, versioning, rate limits, and response contracts are not specified. | Blocks stable mobile API layer. | Phase 1/22 |

## Module-Level Clarifications

| ID | Area | Missing Detail | Recommended Resolution Phase |
| --- | --- | --- | --- |
| MR-011 | Admissions | Application stages, approval workflow, admission test/interview rules, applicant-to-student conversion rules. | Phase 8 |
| MR-012 | Academic | Class/section hierarchy, subject assignment rules, curriculum versioning, term promotion rules. | Phase 9 |
| MR-013 | Attendance | Present/absent/late/leave statuses, cutoff times, correction approvals, notification triggers. | Phase 10 |
| MR-014 | Exams | Exam types, grading rules, question types, online exam proctoring expectations, retake rules. | Phase 11 |
| MR-015 | LMS | Video hosting rules, quiz scoring, progress calculation, material access rules. | Phase 12 |
| MR-016 | Finance | Fee structure, discounts, scholarships, invoice numbering, payment allocation, late fees. | Phase 13 |
| MR-017 | HR and Payroll | Employee categories, salary components, payroll cycle, tax/deduction rules, leave encashment. | Phase 14 |
| MR-018 | Library | Accession numbering, book copies, reservation rules, fine calculation, lost/damaged book handling. | Phase 15 |
| MR-019 | Communication | Message templates, consent rules, delivery tracking, opt-outs, moderation and attachments. | Phase 16 |
| MR-020 | Documents | Document categories, verification states, retention, archival policy, access permissions. | Phase 18 |
| MR-021 | Certificates | Certificate templates, signing authority, QR/verification URL rules, revocation rules. | Phase 19 |
| MR-022 | Meetings | Participant roles, recurrence, calendar integration, approval of minutes, attachments. | Phase 20 |
| MR-023 | Website CMS | Public site routing, school-level branding, moderation, publishing workflow, SEO metadata. | Phase 21 |
| MR-024 | Advanced Finance | Accounting period, chart of accounts structure, journal posting rules, budget approval workflow. | Phase 23 |

## Non-Functional Requirements To Define

| ID | Requirement Gap | Why It Matters | Recommended Resolution Phase |
| --- | --- | --- | --- |
| NFR-001 | Expected scale: number of schools, users, students, concurrent sessions, and records. | Drives database indexing, caching, pagination, and load testing. | Phase 1 |
| NFR-002 | Performance targets for page loads, API latency, report generation, and exports. | Required for production readiness and acceptance testing. | Phase 1 |
| NFR-003 | Accessibility target level, such as WCAG 2.2 AA. | Converts accessibility requirement into testable criteria. | Phase 1 |
| NFR-004 | Browser and device support matrix. | Drives frontend QA and responsive design testing. | Phase 1 |
| NFR-005 | Data privacy, compliance, and retention requirements. | Affects student records, documents, audit logs, backups, and security. | Phase 1 |
| NFR-006 | Observability requirements: logs, metrics, traces, alerts, error monitoring. | Required for enterprise SaaS support and Phase 25. | Phase 1/25 |
| NFR-007 | Deployment target and CI/CD expectations. | Affects architecture, environment configuration, and production readiness. | Phase 1/25 |
| NFR-008 | Disaster recovery objectives: RPO and RTO. | Required for backup and restore design. | Phase 1/24 |

## Current Phase 0 Conclusion

All submitted requirements have been captured. The project is ready for Phase 1 only after approval, with the understanding that Phase 1 must resolve the high-priority architectural and product clarifications above before implementation begins.

