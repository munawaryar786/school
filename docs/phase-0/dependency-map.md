# Dependency Map

Project: School ERP Management System  
Purpose: Identify sequencing, shared dependencies, and approval gates before implementation.

## Phase Gate Chain

```text
Phase 0 -> Approval -> Phase 1 -> Approval -> Phase 2 -> Approval -> Phase 3 -> ... -> Phase 25 -> Final Approval
```

No phase may start until the prior phase has:

1. Completed its scoped deliverables.
2. Completed its testing checklist.
3. Produced a QA report.
4. Received explicit approval.

## Core Dependency Layers

| Layer | Depends On | Enables |
| --- | --- | --- |
| Requirements verification | Product brief | Architecture decisions |
| Architecture | Approved requirements | Foundation implementation |
| Foundation | Architecture, database design, RBAC matrix, navigation plan | All role portals and modules |
| Authentication and RBAC | User model, role model, JWT strategy, route/API guards | Protected portals, mobile APIs, audit trails |
| Multi-school tenancy | Tenant model, data isolation rules, school admin ownership | All school-scoped modules |
| Theme and layout system | Role/module color system, accessibility rules | Consistent UI across portals |
| Storage | S3-compatible bucket strategy, upload validation, permissions | Documents, LMS videos/materials, certificates, backups, CMS media |
| Reports/export | Data models, authorization, PDF/Excel services | Admin exports, reports, invoices, report cards, certificates |
| Audit/activity logging | Auth identity, tenant context, event taxonomy | Admin actions, security review, compliance, backup/restore traceability |

## Module Dependencies

| Module or Phase | Primary Dependencies | Downstream Consumers |
| --- | --- | --- |
| Super Admin Portal | Auth, RBAC, tenant model, audit logs, subscription model | School provisioning, revenue reporting, global user management |
| School Admin Portal | Tenant model, school-scoped RBAC, academic structures | Teacher, student, parent, attendance, exams, fees |
| Academic Module | Academic years, terms, classes, sections, subjects, curriculum | Timetable, attendance, exams, LMS, student enrollment |
| Admissions Module | Applicant records, documents, enrollment rules | Student records, academic placement, parent portal |
| Attendance Module | Students, teachers, staff, academic calendar, timetable | Parent/student dashboards, reports, notifications |
| Examination Module | Academic structures, students, teachers, question bank | Results, report cards, certificates, transcripts |
| LMS Module | Courses, subjects, teachers, students, storage | Student learning, quizzes, progress reports |
| Fees and Finance | Students, invoices, payments, discounts, scholarships | Parent payments, financial reports, advanced finance |
| HR and Payroll | Employees, attendance, leave rules, salary data | Teacher/staff management, payroll reports |
| Library | Students/staff, book inventory, fine rules | Student portal, finance links for fines |
| Communication | Users, roles, notification preferences, templates | Attendance alerts, announcements, parent communication |
| Reports and Analytics | Stable source data across modules | Leadership dashboards, exports, production readiness |
| Document Management | Storage, users, students, teachers, contracts | Admissions, HR, certificates, audits |
| Certificate Management | Students, exams/results, document generation, verification tokens | Student portal, external verification |
| Meeting Management | Users, roles, scheduling, minutes storage | Admin operations and communication |
| Website CMS | Media storage, admissions content, public routing | Public school site, admission pages |
| Mobile API Layer | Stable auth, RBAC, module APIs, rate limits | Student, teacher, and parent mobile apps |
| Advanced Finance | Fees, invoices, payments, accounting structures | Financial statements, budgeting, leadership reports |
| Security Hardening | Full auth surface, audit logs, backups, encryption strategy | Production readiness |
| Production Readiness | Completed modules, test suite, monitoring, deployment plan | Final approval and launch |

## Critical Cross-Cutting Dependencies

| Dependency | Required Before | Risk If Missing |
| --- | --- | --- |
| Multi-school tenant isolation | Any school-scoped data model or API | Cross-school data exposure |
| RBAC matrix | Any protected API or navigation | Unauthorized access and inconsistent UX |
| Audit event taxonomy | Admin, finance, security, and backup workflows | Incomplete accountability trail |
| Form validation standards | Any CRUD or workflow form | Inconsistent data quality |
| API error contract | Frontend integration | Unclear user-facing error handling |
| Pagination/filter/export conventions | Admin tables and reports | Repeated custom behavior and test gaps |
| File upload policy | Documents, LMS, CMS, backups | Storage abuse and security vulnerabilities |
| Notification provider strategy | Attendance, communication, finance | Unreliable SMS/email/push behavior |
| Payment provider strategy | Fee payments and finance | Blocked parent payment workflows |
| PDF/Excel generation strategy | Reports, invoices, certificates | Blocked export deliverables |

## Suggested Phase 1 Architecture Inputs

The following decisions must be made in Phase 1 before implementation:

| Decision | Why It Matters |
| --- | --- |
| Monorepo structure and package boundaries | Keeps frontend, backend, shared validation, and generated clients maintainable. |
| Tenant model and school scoping rules | Defines every major database relationship and authorization check. |
| Role hierarchy and permission granularity | Prevents rework across all protected screens and APIs. |
| API versioning and response envelope | Required before web and mobile API consumers exist. |
| File storage paths, metadata, and access policy | Required for uploads, backups, LMS, CMS, documents, and certificates. |
| Reporting/export service boundaries | Required for PDF and Excel features across phases. |
| Background job strategy | Likely needed for notifications, reports, backups, imports, exports, payroll, and emails. |
| Observability and audit logging approach | Required for enterprise SaaS support and security hardening. |

