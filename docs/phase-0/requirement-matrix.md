# Requirement Matrix

Project: School ERP Management System  
Phase: 0 - Requirements Verification

## Global Product Rules

| ID | Requirement | Verification Status | Notes |
| --- | --- | --- | --- |
| G-001 | Never skip any requirement. | Captured | All listed phases, features, technical constraints, and quality rules are represented in this matrix. |
| G-002 | Never generate placeholder pages. | Captured | Future UI work must implement functional screens only. |
| G-003 | Never generate dummy architecture. | Captured | Architecture must be concrete in Phase 1. |
| G-004 | Never assume requirements are optional. | Captured | Unclear items are listed as missing details, not removed from scope. |
| G-005 | Every module must be fully functional. | Captured | Each module requires model, API, validation, authorization, UI, states, and tests. |
| G-006 | Every phase must be completed and tested before the next phase. | Captured | Phase approval gates are mandatory. |
| G-007 | After each phase, generate testing checklist, QA report, and wait for approval. | Captured | Phase 0 includes these artifacts. |
| G-008 | UI must look handcrafted by a senior product team. | Captured | Applies from Phase 2 onward. |
| G-009 | UI must not look AI-generated. | Captured | Requires cohesive design system and realistic product workflows. |
| G-010 | Follow enterprise SaaS standards. | Captured | Impacts architecture, security, observability, RBAC, tenancy, and auditing. |
| G-011 | Follow accessibility standards. | Captured | Requires WCAG-oriented design and testing in UI phases. |
| G-012 | Use clean, scalable, modular architecture. | Captured | To be designed in Phase 1 and implemented from Phase 2. |
| G-013 | Every feature needs database model, API, validation, authorization, UI, error/loading/success states. | Captured | Applies to all feature phases. |
| G-014 | No shortcuts, mock functionality, or non-production implementations. | Captured | Requires real persistence and verified workflows. |

## Technology Requirements

| ID | Area | Requirement | Verification Status | Phase Impact |
| --- | --- | --- | --- | --- |
| T-001 | Frontend | Next.js App Router | Captured | Phase 1 architecture, Phase 2 setup |
| T-002 | Frontend | React | Captured | Phase 2 setup |
| T-003 | Frontend | TypeScript | Captured | Phase 2 setup |
| T-004 | Frontend | TailwindCSS | Captured | Phase 2 setup |
| T-005 | Frontend | Shadcn UI | Captured | Phase 2 setup |
| T-006 | Frontend | React Hook Form | Captured | Phase 2 setup, all form features |
| T-007 | Frontend | Zod | Captured | Phase 2 setup, validation |
| T-008 | Frontend | TanStack Query | Captured | Phase 2 setup, data fetching |
| T-009 | Backend | Node.js | Captured | Phase 1 architecture, Phase 2 setup |
| T-010 | Backend | Express.js | Captured | Phase 1 architecture, Phase 2 setup |
| T-011 | Backend | TypeScript | Captured | Phase 2 setup |
| T-012 | Database | PostgreSQL | Captured | Phase 1 design, Phase 2 setup |
| T-013 | Database | Prisma ORM | Captured | Phase 1 design, Phase 2 setup |
| T-014 | Authentication | JWT | Captured | Phase 1 design, Phase 2 setup |
| T-015 | Authentication | RBAC | Captured | Phase 1 matrix, Phase 2 setup, all feature phases |
| T-016 | Authentication | Two Factor Authentication | Captured | Phase 1 security design, Phase 24 hardening; baseline strategy needed earlier |
| T-017 | Storage | S3 compatible storage | Captured | Required by document, LMS, CMS, certificate, and backup workflows |
| T-018 | Reports | PDF export | Captured | Required by reports, invoices, certificates, report cards |
| T-019 | Reports | Excel export | Captured | Required by admin lists and analytics |

## Color System

| ID | Role/Area | Required Color | Verification Status |
| --- | --- | --- | --- |
| C-001 | Super Admin | Purple | Captured |
| C-002 | School Admin | Blue | Captured |
| C-003 | Teacher | Green | Captured |
| C-004 | Student | Orange | Captured |
| C-005 | Parent | Pink | Captured |
| C-006 | Academic Modules | Teal | Captured |
| C-007 | Security | Dark Teal | Captured |

## Phase Requirements

| Phase | Name | Required Tasks or Features | Required Testing | Gate |
| --- | --- | --- | --- | --- |
| 0 | Requirements Verification | Review requirements, create traceability matrix, feature checklist, dependency map | Review deliverables for completeness and consistency | Wait for approval |
| 1 | System Architecture | Architecture diagram, database design, API design, folder structure, RBAC matrix, navigation structure, multi-school strategy | Architecture review | Wait for approval |
| 2 | Foundation Setup | Project setup, Prisma, PostgreSQL, auth, RBAC, theme system, layout system, shared components | Login, logout, RBAC, route protection | Wait for approval |
| 3 | Super Admin Portal | Manage schools, administrators, subscriptions, revenue reports, user management, audit logs, system settings, backup and restore | All CRUD operations | Wait for approval |
| 4 | School Admin Portal | Dashboard, academic years, classes, sections, subjects, teachers, students, fees, exams, attendance, library, timetable | All CRUD operations | Wait for approval |
| 5 | Teacher Portal | Class management, attendance, assignments, exams, marks, materials, parent communication, online classes | All teacher workflows | Wait for approval |
| 6 | Student Portal | Attendance, timetable, assignments, materials, results, online exams, certificates, transcripts, fees | Student workflows | Wait for approval |
| 7 | Parent Portal | Child profile, attendance, results, performance, homework, fee payments, communication | Parent workflows | Wait for approval |
| 8 | Admissions Module | Applications, enrollment, documents, reports | Admission workflow | Wait for approval |
| 9 | Academic Module | Academic years, terms, classes, sections, subjects, curriculum | Academic workflow | Wait for approval |
| 10 | Attendance Module | Student attendance, teacher attendance, staff attendance, notifications | Attendance workflow | Wait for approval |
| 11 | Examination Module | Exam scheduling, question bank, online exams, results, report cards | Exam workflow | Wait for approval |
| 12 | LMS Module | Courses, materials, videos, quizzes, progress tracking | Learning workflow | Wait for approval |
| 13 | Fees and Finance | Fees, invoices, payments, scholarships, discounts, reports | Finance workflow | Wait for approval |
| 14 | HR and Payroll | Employees, leaves, payroll, salary slips | HR workflow | Wait for approval |
| 15 | Library Module | Books, issue, return, fine | Library workflow | Wait for approval |
| 16 | Communication Module | SMS, email, push notifications, messaging, announcements | Communication workflow | Wait for approval |
| 17 | Reports and Analytics | Student reports, teacher reports, attendance reports, financial reports, dashboards | Report generation | Wait for approval |
| 18 | Document Management | Student documents, teacher documents, contracts, archive | Upload workflow | Wait for approval |
| 19 | Certificate Management | Certificates, transcripts, verification | Certificate generation | Wait for approval |
| 20 | Meeting Management | Scheduling, minutes, meetings | Meeting workflow | Wait for approval |
| 21 | Website CMS | Website builder, blog, news, announcements, admission pages | CMS workflow | Wait for approval |
| 22 | Mobile API Layer | Student app APIs, teacher app APIs, parent app APIs | API validation | Wait for approval |
| 23 | Advanced Finance | General ledger, chart of accounts, budget management, expenses, financial statements | Finance validation | Wait for approval |
| 24 | Security Hardening | 2FA, audit logs, encryption, backups, API security | Security testing | Wait for approval |
| 25 | Production Readiness | Performance optimization, accessibility audit, SEO, error monitoring, deployment, final report | End-to-end, regression, load testing | Wait for final approval |

## Cross-Feature Acceptance Requirements

Every feature in phases 3 through 23 must include:

| ID | Requirement | Applies To |
| --- | --- | --- |
| X-001 | Database model | All persistent features |
| X-002 | API endpoint or service contract | All interactive features |
| X-003 | Input and business validation | All write operations and workflow transitions |
| X-004 | Authorization check | All protected resources and actions |
| X-005 | User interface | All role-facing features |
| X-006 | Error state | All UI and API workflows |
| X-007 | Loading state | All async UI workflows |
| X-008 | Success state | All completed write/export/upload workflows |
| X-009 | Activity logging where required | Admin, audit, security, finance, and operational modules |
| X-010 | Search, filters, pagination, export where required | Admin data tables and reporting surfaces |

