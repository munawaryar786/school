# Phase 28 Enterprise Transformation Checklist

Status labels permitted in this checklist: `Not Started`, `In Progress`, `Blocked`, `Completed`, `Verified`, `Deferred with Approval`.

Rule: no item may be marked `Completed` without evidence. No implementation code, Prisma schema, migrations, environment variables, deployment settings, or product behavior may be changed during Phase 28A.

## Phase Gate Rules

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Preserve the existing School ERP Management System in `E:\saas` on branch `main` | Not Started | Audit pending |
| Do not restart, replace, delete useful code, or rebuild from scratch | Not Started | Phase rule |
| Do not reset, clean, restore, or discard the working tree | Not Started | Phase rule |
| Do not introduce mock-only or demo-only implementations | Not Started | Phase rule |
| Do not add dead buttons or decorative pages without functionality | Not Started | Phase rule |
| Do not hide errors with `any`, `@ts-ignore`, disabled strict mode, or skipped validation | Not Started | Phase rule |
| Do not change deployment routing without understanding production setup | Not Started | Phase rule |
| Do not commit secrets, tokens, passwords, or database URLs | Not Started | Phase rule |
| Do not begin implementation before Phase 28A audit and Project Owner approval | Not Started | Phase rule |
| Execute Phase 28A only in this session | Not Started | Requested by Project Owner |
| Stop after Phase 28A report and wait for approval | Not Started | Requested by Project Owner |
| Phase 28B begins only after Phase 28A approval | Not Started | Future phase |
| Phase 28C begins only after architecture approval | Not Started | Future phase |
| Phase 28D implements modules in approved priority order | Not Started | Future phase |
| Phase 28E completes QA, security, and production readiness before release | Not Started | Future phase |

## Production Guardrails

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Preserve API domain `https://school-api-gules.vercel.app` | Not Started | Audit pending |
| Preserve web domain `https://school-com-mauve.vercel.app` | Not Started | Audit pending |
| Preserve `GET /health` | Not Started | Audit pending |
| Preserve backend public route prefix `/v1` | Not Started | Audit pending |
| Preserve frontend browser proxy routes `/api/...` to backend `/v1/...` | Not Started | Audit pending |
| Preserve Super Admin production login behavior | Not Started | Audit pending |
| Preserve Neon database connection assumptions | Not Started | Audit pending |
| Preserve JWT access and refresh token behavior | Not Started | Audit pending |
| Preserve Vercel roots `apps/api` and `apps/web` | Not Started | Audit pending |
| Preserve Node.js 22 compatibility | Not Started | Audit pending |
| Preserve Express default export deployment shape | Not Started | Audit pending |
| Preserve Prisma generation flow | Not Started | Audit pending |
| Preserve current root production build behavior | Not Started | Audit pending |
| Do not restore backend `/api/v1` route prefix without proof of no Vercel conflict | Not Started | Audit pending |
| Do not add invalid Vercel runtime configuration | Not Started | Audit pending |
| Do not reintroduce incorrect `WEB_ORIGIN` | Not Started | Audit pending |
| Do not use source TypeScript runtime package entries where built output is required | Not Started | Audit pending |
| Do not break shared package build requirements | Not Started | Audit pending |
| Do not remove Express default export | Not Started | Audit pending |
| Do not deploy frontend using API root | Not Started | Audit pending |
| Do not expose backend secrets in frontend project | Not Started | Audit pending |
| Do not place generated JavaScript inside `packages/shared/src` | Not Started | Audit pending |
| Do not reintroduce API/frontend shared package module-format conflict | Not Started | Audit pending |
| Document all deployment rules in Phase 28A report | Not Started | Audit pending |

## Phase 28A Allowed and Forbidden Actions

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Documentation files may be created | Completed | This checklist is a documentation file |
| Read-only commands may be executed | Not Started | Command log pending |
| Existing builds and tests may be run for evidence | Not Started | Validation pending |
| Read-only Prisma inspection may be executed | Not Started | Validation pending |
| Static searches and route inventory scripts may be executed | Not Started | Validation pending |
| Do not modify implementation code | Not Started | Phase rule |
| Do not modify Prisma schema | Not Started | Phase rule |
| Do not create migrations | Not Started | Phase rule |
| Do not change environment variables | Not Started | Phase rule |
| Do not redeploy | Not Started | Phase rule |
| Do not change Vercel settings | Not Started | Phase rule |
| Do not commit product code | Not Started | Phase rule |
| Do not run destructive database or Git commands | Not Started | Phase rule |

## Step 1 - Master Checklist

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Create `docs/phase-28-enterprise-transformation-checklist.md` first | Completed | This file |
| Include every requirement from the Project Owner prompt | In Progress | Initial checklist created; coverage will be rechecked before final |
| Use only approved status labels | Completed | Labels listed at top |
| Include existing architecture audit | Not Started | Audit pending |
| Include existing frontend audit | Not Started | Audit pending |
| Include existing backend audit | Not Started | Audit pending |
| Include database audit | Not Started | Audit pending |
| Include authentication audit | Not Started | Audit pending |
| Include authorization audit | Not Started | Audit pending |
| Include multi-tenancy audit | Not Started | Audit pending |
| Include API route audit | Not Started | Audit pending |
| Include Vercel deployment audit | Not Started | Audit pending |
| Include UI/UX audit | Not Started | Audit pending |
| Include accessibility audit | Not Started | Audit pending |
| Include performance audit | Not Started | Audit pending |
| Include security audit | Not Started | Audit pending |
| Include testing audit | Not Started | Audit pending |
| Include feature inventory | Not Started | Audit pending |
| Include feature-gap matrix | Not Started | Audit pending |
| Include design-system proposal | Not Started | Proposal pending |
| Include role-portal proposal | Not Started | Proposal pending |
| Include module roadmap | Not Started | Roadmap pending |
| Include migration strategy | Not Started | Strategy pending |
| Include production rollout strategy | Not Started | Strategy pending |

## Step 2 - Existing Project Inspection

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Read `AGENTS.md` if present | Not Started | Audit pending |
| Read root `README` files | Not Started | Audit pending |
| Read `docs` directory | Not Started | Audit pending |
| Inspect root `package.json` | Not Started | Audit pending |
| Inspect `package-lock.json` | Not Started | Audit pending |
| Inspect `tsconfig.base.json` | Not Started | Audit pending |
| Inspect all workspace package files | Not Started | Audit pending |
| Inspect Prisma schema | Not Started | Audit pending |
| Inspect Prisma migrations | Not Started | Audit pending |
| Inspect seed scripts | Not Started | Audit pending |
| Inspect API environment validation | Not Started | Audit pending |
| Inspect authentication code | Not Started | Audit pending |
| Inspect permission constants | Not Started | Audit pending |
| Inspect backend middleware | Not Started | Audit pending |
| Inspect frontend middleware | Not Started | Audit pending |
| Inspect frontend API proxy routes | Not Started | Audit pending |
| Inspect Next.js configuration | Not Started | Audit pending |
| Inspect Tailwind configuration | Not Started | Audit pending |
| Inspect Vercel-related configuration | Not Started | Audit pending |
| Inspect all role dashboards | Not Started | Audit pending |
| Inspect all module pages | Not Started | Audit pending |
| Inspect all API routes | Not Started | Audit pending |
| Inspect all services and repositories | Not Started | Audit pending |
| Inspect all shared schemas | Not Started | Audit pending |
| Inspect all reusable UI components | Not Started | Audit pending |
| Inspect all tests | Not Started | Audit pending |
| Generate complete folder and file inventory | Not Started | Inventory pending |
| Open and inspect actual implementation, not filenames only | Not Started | Audit pending |

## Step 3 - Current Feature Inventory

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Create feature matrix with feature name | Not Started | Deliverable pending |
| Map intended role | Not Started | Deliverable pending |
| Map UI page | Not Started | Deliverable pending |
| Map frontend API route | Not Started | Deliverable pending |
| Map backend API route | Not Started | Deliverable pending |
| Map service | Not Started | Deliverable pending |
| Map repository | Not Started | Deliverable pending |
| Map Prisma model | Not Started | Deliverable pending |
| Map permission | Not Started | Deliverable pending |
| Map current status | Not Started | Deliverable pending |
| Map validation status | Not Started | Deliverable pending |
| Map production status | Not Started | Deliverable pending |
| Map problems | Not Started | Deliverable pending |
| Map recommended action | Not Started | Deliverable pending |
| Classify fully working features | Not Started | Audit pending |
| Classify partially working features | Not Started | Audit pending |
| Classify UI-only features | Not Started | Audit pending |
| Classify backend-only features | Not Started | Audit pending |
| Classify mock-data features | Not Started | Audit pending |
| Classify broken features | Not Started | Audit pending |
| Classify missing features | Not Started | Audit pending |
| Classify duplicate features | Not Started | Audit pending |
| Classify obsolete features | Not Started | Audit pending |
| Classify unsafe features | Not Started | Audit pending |
| Classify unverified features | Not Started | Audit pending |
| Explicitly inspect Create operations | Not Started | Audit pending |
| Explicitly inspect Read operations | Not Started | Audit pending |
| Explicitly inspect Update operations | Not Started | Audit pending |
| Explicitly inspect Delete operations | Not Started | Audit pending |
| Verify user can perform each action | Not Started | Audit pending |
| Verify frontend sends correct request | Not Started | Audit pending |
| Verify authentication is validated | Not Started | Audit pending |
| Verify authorization is validated | Not Started | Audit pending |
| Verify tenant scope is validated | Not Started | Audit pending |
| Verify backend validation runs | Not Started | Audit pending |
| Verify database transaction succeeds | Not Started | Audit pending |
| Verify UI reflects result | Not Started | Audit pending |
| Verify errors are displayed clearly | Not Started | Audit pending |
| Verify audit logging where required | Not Started | Audit pending |

## Step 4 - Role and Permission Audit

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit `SUPER_ADMIN` | Not Started | Audit pending |
| Audit `SCHOOL_ADMIN` | Not Started | Audit pending |
| Audit `TEACHER` | Not Started | Audit pending |
| Audit `STUDENT` | Not Started | Audit pending |
| Audit `PARENT` | Not Started | Audit pending |
| Audit `FINANCE_OFFICER` | Not Started | Audit pending |
| Audit `HR_OFFICER` | Not Started | Audit pending |
| Audit `LIBRARIAN` | Not Started | Audit pending |
| Audit `ADMISSIONS_OFFICER` | Not Started | Audit pending |
| Audit additional existing roles | Not Started | Audit pending |
| Document login account availability per role | Not Started | Audit pending |
| Document login success per role | Not Started | Audit pending |
| Document default landing page per role | Not Started | Audit pending |
| Document navigation menu per role | Not Started | Audit pending |
| Document dashboard widgets per role | Not Started | Audit pending |
| Document allowed pages per role | Not Started | Audit pending |
| Document allowed API routes per role | Not Started | Audit pending |
| Document required permissions per role | Not Started | Audit pending |
| Document tenant scope per role | Not Started | Audit pending |
| Document school scope per role | Not Started | Audit pending |
| Document campus scope per role | Not Started | Audit pending |
| Document read permissions per role | Not Started | Audit pending |
| Document create permissions per role | Not Started | Audit pending |
| Document update permissions per role | Not Started | Audit pending |
| Document delete permissions per role | Not Started | Audit pending |
| Document export permissions per role | Not Started | Audit pending |
| Document approval permissions per role | Not Started | Audit pending |
| Document missing permissions | Not Started | Audit pending |
| Document incorrect permissions | Not Started | Audit pending |
| Document privilege-escalation risks | Not Started | Audit pending |
| Verify permissions are enforced server-side | Not Started | Audit pending |
| Verify UI hiding is not treated as authorization | Not Started | Audit pending |
| Review fine-grained permission model | Not Started | Audit pending |
| Review permission consistency | Not Started | Audit pending |
| Review permission reusability | Not Started | Audit pending |
| Review permission auditability | Not Started | Audit pending |
| Review tenant-bypass protection | Not Started | Audit pending |
| Review IDOR protection | Not Started | Audit pending |

## Step 5 - Multi-School and Multi-Campus Audit

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit multiple school organization support | Not Started | Audit pending |
| Audit multiple campuses per school support | Not Started | Audit pending |
| Audit school-specific users | Not Started | Audit pending |
| Audit campus-specific users | Not Started | Audit pending |
| Audit cross-school Super Admin access | Not Started | Audit pending |
| Audit School Admin restriction to assigned schools | Not Started | Audit pending |
| Audit optional staff multi-campus access | Not Started | Audit pending |
| Audit student school and campus assignment | Not Started | Audit pending |
| Audit parent access only to linked children | Not Started | Audit pending |
| Audit teacher access only to assigned classes and subjects | Not Started | Audit pending |
| Audit finance access only to authorized school accounts | Not Started | Audit pending |
| Audit school-specific configuration | Not Started | Audit pending |
| Audit school-specific branding | Not Started | Audit pending |
| Audit school-specific academic calendars | Not Started | Audit pending |
| Audit school-specific fee structures | Not Started | Audit pending |
| Audit school-specific reports | Not Started | Audit pending |
| Audit school-specific document templates | Not Started | Audit pending |
| Audit centralized Super Admin monitoring | Not Started | Audit pending |
| Review Prisma models and queries for `schoolId` | Not Started | Audit pending |
| Review Prisma models and queries for `campusId` | Not Started | Audit pending |
| Review tenant ownership | Not Started | Audit pending |
| Identify cross-tenant leakage risks | Not Started | Audit pending |
| Identify missing database indexes | Not Started | Audit pending |
| Identify missing unique constraints | Not Started | Audit pending |
| Identify unsafe global queries | Not Started | Audit pending |
| Identify missing transaction boundaries | Not Started | Audit pending |
| Identify unsafe nested writes | Not Started | Audit pending |
| Identify soft-delete requirements | Not Started | Audit pending |
| Identify audit-history requirements | Not Started | Audit pending |
| Propose defense-in-depth tenant isolation strategy | Not Started | Proposal pending |
| Assess PostgreSQL row-level security appropriateness without implementation | Not Started | Proposal pending |
| Identify tables affected by possible row-level security | Not Started | Proposal pending |

## Step 6 - UX and UI Audit

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit information architecture | Not Started | Audit pending |
| Audit navigation depth | Not Started | Audit pending |
| Audit page hierarchy | Not Started | Audit pending |
| Audit dashboard density | Not Started | Audit pending |
| Audit role-specific workflows | Not Started | Audit pending |
| Audit form complexity | Not Started | Audit pending |
| Audit table usability | Not Started | Audit pending |
| Audit mobile usability | Not Started | Audit pending |
| Audit tablet usability | Not Started | Audit pending |
| Audit desktop usability | Not Started | Audit pending |
| Audit empty states | Not Started | Audit pending |
| Audit error states | Not Started | Audit pending |
| Audit loading states | Not Started | Audit pending |
| Audit skeleton states | Not Started | Audit pending |
| Audit confirmation flows | Not Started | Audit pending |
| Audit destructive-action safeguards | Not Started | Audit pending |
| Audit bulk actions | Not Started | Audit pending |
| Audit search | Not Started | Audit pending |
| Audit filtering | Not Started | Audit pending |
| Audit sorting | Not Started | Audit pending |
| Audit pagination | Not Started | Audit pending |
| Audit saved views | Not Started | Audit pending |
| Audit export flows | Not Started | Audit pending |
| Audit import flows | Not Started | Audit pending |
| Audit accessibility | Not Started | Audit pending |
| Audit visual consistency | Not Started | Audit pending |
| Audit dark mode readiness | Not Started | Audit pending |
| Audit internationalization readiness | Not Started | Audit pending |
| Audit keyboard navigation | Not Started | Audit pending |
| Audit screen-reader semantics | Not Started | Audit pending |
| Audit touch target sizes | Not Started | Audit pending |
| Audit focus states | Not Started | Audit pending |
| Audit contrast | Not Started | Audit pending |
| Audit reduced-motion support | Not Started | Audit pending |
| Identify generic repeated pages | Not Started | Audit pending |
| Identify duplicate components | Not Started | Audit pending |
| Identify inconsistent spacing | Not Started | Audit pending |
| Identify inconsistent colors | Not Started | Audit pending |
| Identify inconsistent typography | Not Started | Audit pending |
| Identify inconsistent form controls | Not Started | Audit pending |
| Identify non-functional controls | Not Started | Audit pending |
| Identify tables that do not scale | Not Started | Audit pending |
| Identify weak dashboard cards | Not Started | Audit pending |
| Identify missing drill-down paths | Not Started | Audit pending |
| Identify weak mobile navigation | Not Started | Audit pending |
| Identify unclear action priority | Not Started | Audit pending |
| Identify UI actions not connected to APIs | Not Started | Audit pending |

## Step 7 - Enterprise Design System Proposal

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Propose brand colors | Not Started | Proposal pending |
| Propose semantic colors | Not Started | Proposal pending |
| Propose role accent colors | Not Started | Proposal pending |
| Propose neutral scale | Not Started | Proposal pending |
| Propose success, warning, error, and information colors | Not Started | Proposal pending |
| Propose background layers | Not Started | Proposal pending |
| Propose surface layers | Not Started | Proposal pending |
| Propose border colors | Not Started | Proposal pending |
| Propose text hierarchy | Not Started | Proposal pending |
| Propose typography scale | Not Started | Proposal pending |
| Propose spacing scale | Not Started | Proposal pending |
| Propose radius scale | Not Started | Proposal pending |
| Propose elevation scale | Not Started | Proposal pending |
| Propose motion tokens | Not Started | Proposal pending |
| Propose z-index scale | Not Started | Proposal pending |
| Propose breakpoints | Not Started | Proposal pending |
| Propose chart palette | Not Started | Proposal pending |
| Propose status palette | Not Started | Proposal pending |
| Propose light theme mode | Not Started | Proposal pending |
| Propose dark theme mode | Not Started | Proposal pending |
| Propose system theme mode | Not Started | Proposal pending |
| Propose high contrast theme mode | Not Started | Proposal pending |
| Propose reduced motion mode | Not Started | Proposal pending |
| Require theme selection persistence per user | Not Started | Proposal pending |
| Ensure dark mode is not simple color inversion | Not Started | Proposal pending |
| Require tested semantic color values for light and dark modes | Not Started | Proposal pending |
| Propose unified role accent strategy | Not Started | Proposal pending |
| Super Admin accent family violet | Not Started | Proposal pending |
| School Admin accent family blue | Not Started | Proposal pending |
| Teacher accent family green | Not Started | Proposal pending |
| Student accent family orange | Not Started | Proposal pending |
| Parent accent family rose | Not Started | Proposal pending |
| Finance accent family amber | Not Started | Proposal pending |
| HR accent family brown or warm neutral | Not Started | Proposal pending |
| Library accent family teal | Not Started | Proposal pending |
| Admissions accent family cyan | Not Started | Proposal pending |
| Preserve semantic interaction meanings across role accents | Not Started | Proposal pending |
| Propose all required component families | Not Started | Proposal pending |
| Require each component to support light theme | Not Started | Proposal pending |
| Require each component to support dark theme | Not Started | Proposal pending |
| Require keyboard support per component | Not Started | Proposal pending |
| Require screen-reader semantics per component | Not Started | Proposal pending |
| Require responsive behavior per component | Not Started | Proposal pending |
| Require loading, disabled, and error states per component | Not Started | Proposal pending |
| Require test coverage per component | Not Started | Proposal pending |

## Step 8 - Role Portal Requirements

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Create current-versus-target matrix for Super Admin Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for School Admin Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Teacher Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Student Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Parent Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Finance Officer Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for HR Officer Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Librarian Portal | Not Started | Deliverable pending |
| Create current-versus-target matrix for Admissions Officer Portal | Not Started | Deliverable pending |
| Assess Super Admin global dashboard, tenant, subscription, security, monitoring, templates, integrations, support, backup, settings, and export governance capabilities | Not Started | Audit pending |
| Assess School Admin academic, SIS, staff, admissions, attendance, exams, fees, HR, library, inventory, transport, communication, documents, reports, branding, approvals, and audit capabilities | Not Started | Audit pending |
| Assess Teacher timetable, class, attendance, lessons, assignments, grading, exams, materials, behavior, communication, leave, insight, and export capabilities | Not Started | Audit pending |
| Assess Student profile, timetable, attendance, assignments, lessons, exams, results, fees, library, certificates, communication, calendar, transport, support, and download capabilities | Not Started | Audit pending |
| Assess Parent child switcher, child data, academic, assignments, communication, fees, payments, transport, leave, consent, events, documents, meetings, and preferences capabilities | Not Started | Audit pending |
| Assess Finance fees, invoices, payments, discounts, reconciliation, ledger readiness, reports, budgets, approvals, audit, and export capabilities | Not Started | Audit pending |
| Assess HR employee, recruitment, onboarding, contracts, departments, attendance, shifts, leave, payroll, reviews, training, documents, compliance, reports, and approvals capabilities | Not Started | Audit pending |
| Assess Library dashboard, catalog, metadata, copies, barcode readiness, circulation, fines, stock, history, digital resources, reports, and notifications capabilities | Not Started | Audit pending |
| Assess Admissions inquiry, leads, applications, stages, documents, eligibility, interviews, assessments, offers, waitlists, rejections, enrollment, communication, portal readiness, analytics, and funnel capabilities | Not Started | Audit pending |

## Step 9 - Core Functional Modules

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit Admissions module and all listed sub-capabilities | Not Started | Audit pending |
| Audit Student Information System and all listed sub-capabilities | Not Started | Audit pending |
| Audit Academic module and all listed sub-capabilities | Not Started | Audit pending |
| Audit Attendance module and all listed sub-capabilities | Not Started | Audit pending |
| Audit Examination and Gradebook module and all listed sub-capabilities | Not Started | Audit pending |
| Audit LMS module and all listed sub-capabilities | Not Started | Audit pending |
| Audit Fees and Finance module and all listed sub-capabilities | Not Started | Audit pending |
| Audit HR and Payroll module and all listed sub-capabilities | Not Started | Audit pending |
| Audit Library module and all listed sub-capabilities | Not Started | Audit pending |

## Step 10 - Additional Enterprise Modules

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Assess transport management and related route, vehicle, driver, assignment, and GPS readiness | Not Started | Audit pending |
| Assess hostel management | Not Started | Audit pending |
| Assess cafeteria management | Not Started | Audit pending |
| Assess inventory, procurement, vendors, purchase orders, assets, and maintenance | Not Started | Audit pending |
| Assess events, clubs, and sports | Not Started | Audit pending |
| Assess discipline, behavior, counseling, health, and clinic | Not Started | Audit pending |
| Assess visitor and front-desk management | Not Started | Audit pending |
| Assess ID cards, certificates, document templates, and e-signature readiness | Not Started | Audit pending |
| Assess alumni and fundraising readiness | Not Started | Audit pending |
| Assess facilities, room booking, maintenance requests, help desk, support tickets, and knowledge base | Not Started | Audit pending |
| Classify additional modules as Phase 1 essential, Phase 2 recommended, Phase 3 optional, integration only, or out of scope | Not Started | Proposal pending |
| Do not automatically implement optional modules | Not Started | Phase rule |

## Step 11 - Communication Platform

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit and propose in-app notifications | Not Started | Audit pending |
| Audit and propose email | Not Started | Audit pending |
| Audit and propose SMS | Not Started | Audit pending |
| Audit and propose push notification readiness | Not Started | Audit pending |
| Audit and propose WhatsApp integration readiness | Not Started | Audit pending |
| Audit and propose announcements and broadcasts | Not Started | Audit pending |
| Audit and propose direct and parent-teacher messages | Not Started | Audit pending |
| Audit and propose notification templates and preferences | Not Started | Audit pending |
| Audit and propose delivery status, retry handling, scheduled messages, emergency alerts, and read receipts | Not Started | Audit pending |
| Audit and propose communication audit trail | Not Started | Audit pending |
| Ensure no communication provider secrets are stored in source control | Not Started | Audit pending |

## Step 12 - Reports and Analytics

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Propose operational dashboards | Not Started | Proposal pending |
| Propose student, teacher, parent, school, and multi-school dashboards | Not Started | Proposal pending |
| Propose attendance, academic, risk, fees, admissions, workload, library, finance, and HR analytics | Not Started | Proposal pending |
| Propose custom, filterable, saved, and scheduled reports | Not Started | Proposal pending |
| Propose CSV, Excel, PDF, and print export flows | Not Started | Proposal pending |
| Propose data-access permissions, PII masking, and report audit logs | Not Started | Proposal pending |
| Require accessible charts with textual summaries | Not Started | Proposal pending |

## Step 13 - Enterprise Workflow Engine

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Assess reusable approval and workflow engine need | Not Started | Audit pending |
| Assess candidate workflows: admissions, transfers, promotions, discounts, refunds, expenses, leave, attendance correction, marks correction, result publication, document verification, payroll, purchases, access requests, data exports | Not Started | Audit pending |
| Propose workflow states: draft, submitted, under review, approved, rejected, returned, cancelled, escalated | Not Started | Proposal pending |
| Propose approvers, levels, comments, attachments, deadlines, escalations, notifications, history, and audit trail | Not Started | Proposal pending |

## Step 14 - Security and Compliance Audit

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit password hashing | Not Started | Audit pending |
| Audit JWT access tokens and refresh tokens | Not Started | Audit pending |
| Audit token rotation, logout invalidation, and session storage | Not Started | Audit pending |
| Audit cookie security, CSRF, CORS, rate limiting, brute-force, and lockout | Not Started | Audit pending |
| Audit 2FA readiness, password reset, email verification, and account activation | Not Started | Audit pending |
| Audit RBAC, permission enforcement, tenant isolation, object authorization, and audit logging | Not Started | Audit pending |
| Audit sensitive data exposure, API error leakage, uploads, MIME, file size, and malware scanning readiness | Not Started | Audit pending |
| Audit SQL injection, XSS, CSP, security headers, webhook auth, API keys, export security, and backup security | Not Started | Audit pending |
| Audit secret management, PII masking, log redaction, retention, account deletion, and disaster recovery | Not Started | Audit pending |
| Propose optional 2FA | Not Started | Proposal pending |
| Propose optional SSO through OIDC or SAML | Not Started | Proposal pending |
| Propose login history and device/session management | Not Started | Proposal pending |
| Propose security alerts and step-up auth for destructive actions | Not Started | Proposal pending |
| Propose Super Admin impersonation with audit evidence | Not Started | Proposal pending |
| Propose break-glass access policy | Not Started | Proposal pending |
| Do not implement security changes during Phase 28A | Not Started | Phase rule |

## Step 15 - Accessibility Requirements

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Target WCAG 2.2 AA | Not Started | Proposal pending |
| Audit semantic HTML and heading hierarchy | Not Started | Audit pending |
| Audit form labels, error associations, and ARIA usage | Not Started | Audit pending |
| Audit keyboard-only navigation, focus, traps, restoration, and skip links | Not Started | Audit pending |
| Audit modal focus trapping and screen-reader announcements | Not Started | Audit pending |
| Audit touch target sizing, text contrast, non-text contrast, reflow, and zoom | Not Started | Audit pending |
| Audit reduced motion | Not Started | Audit pending |
| Audit accessible charts and tables | Not Started | Audit pending |
| Audit captions readiness, language attributes, error summaries, accessible authentication, and timeout warnings | Not Started | Audit pending |
| Include accessibility in component architecture instead of after feature completion | Not Started | Proposal pending |

## Step 16 - Internationalization and Localization

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Assess multiple language readiness | Not Started | Audit pending |
| Assess right-to-left support | Not Started | Audit pending |
| Assess locale-aware dates, times, numbers, and currencies | Not Started | Audit pending |
| Assess time zones and school-specific timezone | Not Started | Audit pending |
| Assess academic calendar localization | Not Started | Audit pending |
| Assess translation keys | Not Started | Audit pending |
| Assess localized validation messages, notifications, reports, and document templates | Not Started | Audit pending |
| Avoid hardcoded presentation strings in target architecture | Not Started | Proposal pending |

## Step 17 - Data Import, Export, and Migration

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit and propose CSV import | Not Started | Audit pending |
| Audit and propose Excel import | Not Started | Audit pending |
| Audit and propose field mapping and validation preview | Not Started | Audit pending |
| Audit and propose dry-run import, duplicate detection, partial failure reports, import history, and rollback | Not Started | Audit pending |
| Audit and propose student, staff, fee, marks, attendance, and library bulk imports | Not Started | Audit pending |
| Audit and propose school migration toolkit | Not Started | Audit pending |
| Audit and propose export permissions, audit logs, and data portability | Not Started | Audit pending |

## Step 18 - Integration Architecture

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Assess REST API readiness | Not Started | Audit pending |
| Assess webhooks readiness | Not Started | Audit pending |
| Assess payment, SMS, email, push, video, storage, accounting, biometric, QR/barcode, GPS, SSO, calendar, government reporting, and learning-content integrations | Not Started | Audit pending |
| Propose adapter pattern and provider interfaces | Not Started | Proposal pending |
| Propose credential isolation, retry policies, idempotency, webhook signatures, event logging, dead-letter handling, and provider health status | Not Started | Proposal pending |

## Step 19 - Observability and Operations

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit and propose structured logs and request IDs | Not Started | Audit pending |
| Audit and propose audit logs and error tracking | Not Started | Audit pending |
| Audit and propose performance monitoring, API latency, DB latency, and slow queries | Not Started | Audit pending |
| Audit and propose failed job and queue monitoring | Not Started | Audit pending |
| Audit and propose uptime, health, database health, storage health, notification provider health, deployment health, and release tracking | Not Started | Audit pending |
| Audit and propose security-event monitoring, alerting, backup monitoring, restore verification, and operational dashboard | Not Started | Audit pending |

## Step 20 - Performance and Scalability

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit Next.js rendering strategy, Server Components, and Client Components | Not Started | Audit pending |
| Audit bundle size, data fetching duplication, API duplication, and caching | Not Started | Audit pending |
| Audit pagination, large tables, N+1 queries, indexes, expensive reports, and transactions | Not Started | Audit pending |
| Audit Prisma connection usage, serverless cold starts, pooling, images, file storage, background jobs, notifications, and exports | Not Started | Audit pending |
| Propose targets for dashboard load time | Not Started | Proposal pending |
| Propose targets for API p95 latency | Not Started | Proposal pending |
| Propose targets for login latency | Not Started | Proposal pending |
| Propose targets for search latency | Not Started | Proposal pending |
| Propose targets for table pagination | Not Started | Proposal pending |
| Propose targets for report generation | Not Started | Proposal pending |
| Propose targets for bulk import | Not Started | Proposal pending |
| Propose targets for concurrent users | Not Started | Proposal pending |
| Propose targets for error rate | Not Started | Proposal pending |
| Propose targets for availability | Not Started | Proposal pending |
| Do not invent performance claims without testing | Not Started | Phase rule |

## Step 21 - Testing and Quality Strategy

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Audit current tests | Not Started | Audit pending |
| Create unit test target matrix for validation, permissions, services, calculations, grading, fees, attendance, and workflows | Not Started | Deliverable pending |
| Create integration test target matrix for Prisma repositories, API endpoints, auth, tenant isolation, transactions, and audit logs | Not Started | Deliverable pending |
| Create E2E test target matrix for every role login, redirect, navigation, dashboard, CRUD, denial, logout, and session persistence | Not Started | Deliverable pending |
| Include critical E2E flows from school creation through parent/student result viewing | Not Started | Deliverable pending |
| Create security test matrix for cross-tenant access, IDOR, role escalation, tokens, permissions, rate limiting, and upload abuse | Not Started | Deliverable pending |
| Create UX test matrix for responsive layout, keyboard, landmarks, dark mode, high contrast, reduced motion, errors, empty states, and slow network | Not Started | Deliverable pending |
| Create regression test matrix for route prefix, Vercel deployment, shared package resolution, Prisma generation, build, health, proxy, cookies, and redirects | Not Started | Deliverable pending |
| Require automated regression coverage for critical flows before production-ready status | Not Started | Proposal pending |

## Step 23 - Required Phase 28A Deliverables

| Deliverable | Status | Evidence / Notes |
| --- | --- | --- |
| `docs/phase-28-enterprise-transformation-checklist.md` | Completed | This file |
| `docs/phase-28-existing-system-audit.md` | Completed | Created from static repo inspection and recorded validation limits |
| `docs/phase-28-feature-gap-matrix.md` | Completed | Created with current/reference/target gap matrix |
| `docs/phase-28-role-permission-matrix.md` | Completed | Created from shared role, middleware, app shell, and backend route evidence |
| `docs/phase-28-ui-ux-audit.md` | Completed | Created from inspected frontend implementation |
| `docs/phase-28-database-and-multi-tenancy-audit.md` | Completed | Created from Prisma schema and route scoping evidence |
| `docs/phase-28-api-and-crud-audit.md` | Completed | Created from backend route and frontend proxy/action evidence |
| `docs/phase-28-enterprise-architecture-proposal.md` | Completed | Created as proposal only; no implementation performed |
| `docs/phase-28-development-roadmap.md` | Completed | Created with phase order, dependencies, risks, acceptance criteria, validation and rollback plans |
| `docs/phase-28-owner-decision-register.md` | Completed | Created with approval decisions required before Phase 28B |

## Step 24 - Benchmark Research

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Research PowerSchool official product information and UX patterns | Not Started | Research pending |
| Research Infinite Campus official product information and UX patterns | Not Started | Research pending |
| Research Blackbaud K-12 official product information and UX patterns | Not Started | Research pending |
| Research OpenEduCat official product information and UX patterns | Not Started | Research pending |
| Research other relevant enterprise School ERP or SIS platforms | Not Started | Research pending |
| Research only feature coverage, IA, workflows, portal separation, reports, operational modules, security, and administration patterns | Not Started | Research pending |
| Do not copy branding, proprietary text, screen designs, source code, icons, assets, or protected workflows | Not Started | Research rule |
| Create original recommendations for this project | Not Started | Proposal pending |
| Record research sources in audit report | Not Started | Audit pending |

## Final Phase 28A Response Requirements

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Include Executive Summary | Not Started | Final response pending |
| Include Checklist Status | Not Started | Final response pending |
| Include Existing-System Findings | Not Started | Final response pending |
| Include Complete Feature-Gap Summary | Not Started | Final response pending |
| Include Enterprise Target Recommendation | Not Started | Final response pending |
| Include Proposed Development Phases | Not Started | Final response pending |
| Include exact documentation files created | Not Started | Final response pending |
| Include exact commands executed with pass/fail results | Not Started | Final response pending |
| Include Project Owner decisions required | Not Started | Final response pending |
| Stop after full Phase 28A audit | Not Started | Final response pending |
| Wait for explicit Project Owner approval before Phase 28B | Not Started | Final response pending |

## Phase 28A Completion Update

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Phase 28A documentation-only execution | Completed | Only `docs/phase-28-*.md` files are untracked in `git status --short` |
| Existing architecture/frontend/backend/database/auth/deployment audit | Completed | See `phase-28-existing-system-audit.md`, `phase-28-api-and-crud-audit.md`, and `phase-28-database-and-multi-tenancy-audit.md` |
| Feature inventory and feature-gap matrix | Completed | See `phase-28-feature-gap-matrix.md` |
| Role and permission audit | Completed | See `phase-28-role-permission-matrix.md` |
| UI/UX/accessibility/design-system audit and proposal | Completed | See `phase-28-ui-ux-audit.md` and `phase-28-enterprise-architecture-proposal.md` |
| Development roadmap and owner decisions | Completed | See `phase-28-development-roadmap.md` and `phase-28-owner-decision-register.md` |
| Runtime typecheck/test/build validation | Blocked | `npm run typecheck --workspaces --if-present`, `npm run test --workspaces --if-present`, and package builds failed due local Node install-directory and Windows memory/paging-file errors |
| Production E2E role login and CRUD validation | Blocked | Phase 28A had no production credentials beyond reported Super Admin context; no database writes were performed |
| Phase 28B implementation | Not Started | Waiting for explicit Project Owner approval |
