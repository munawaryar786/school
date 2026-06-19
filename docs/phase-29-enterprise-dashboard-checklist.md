# Phase 29 Enterprise Dashboard Checklist

Status labels: `Not Started`, `In Progress`, `Blocked`, `Completed`, `Verified`, `Deferred with Approval`.

Phase 29 objective: complete the enterprise dashboard, design system, and core School ERP functional workflows while preserving the existing Next.js, React, TypeScript, Tailwind, Node.js, Express, Prisma, PostgreSQL/Neon, JWT, REST, npm workspace, and Vercel architecture.

Verification rule for features: a feature is `Verified` only when UI works, API request works, authentication works, authorization works, tenant scope works, validation works, database operation works, UI refreshes correctly, errors are shown properly, and the relevant audit event is recorded.

## Initial Guardrails

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Continue existing production School ERP project | In Progress | Repository `E:\saas` inspected; no replacement project created |
| Do not restart or replace project | Completed | Existing monorepo preserved |
| Do not discard current changes | Completed | Initial worktree was clean |
| Do not reset, restore, clean, or delete useful code | Completed | No destructive git command run |
| Do not run `git reset --hard` | Completed | Not run |
| Do not run `git clean` | Completed | Not run |
| Do not overwrite completed audit documents | Completed | New Phase 29 checklist created only |
| Preserve production web URL `https://school-com-mauve.vercel.app` | In Progress | No deployment changes made |
| Preserve production API URL `https://school-api-gules.vercel.app` | In Progress | No deployment changes made |
| Preserve API health `GET /health` | In Progress | No backend health edits made |
| Preserve backend route prefix `/v1` | In Progress | No backend routing edits made |
| Preserve frontend proxy routes `/api/...` | In Progress | No frontend proxy edits made |
| Preserve Vercel deployment architecture | In Progress | No Vercel config edits made |
| Inspect uncommitted changes before edits | Completed | `git status`, `git diff --stat`, and `git diff` run before edits |
| Current branch should be `phase-29-enterprise-dashboard` | Completed | Branch did not exist; created locally from clean `main` after approval |

## Required Startup Commands

| Command | Status | Result |
| --- | --- | --- |
| `git status` | Completed | Clean worktree on `main`; branch mismatch found |
| `git diff --stat` | Completed | No output |
| `git diff` | Completed | No output |

## Phase 28 Documents Read

| Document | Status | Notes |
| --- | --- | --- |
| `docs/phase-28-existing-system-audit.md` | Completed | Read before implementation decisions |
| `docs/phase-28-feature-gap-matrix.md` | Completed | Read before implementation decisions |
| `docs/phase-28-role-permission-matrix.md` | Completed | Read before implementation decisions |
| `docs/phase-28-ui-ux-audit.md` | Completed | Read before implementation decisions |
| `docs/phase-28-api-and-crud-audit.md` | Completed | Read before implementation decisions |
| `docs/phase-28-database-and-multi-tenancy-audit.md` | Completed | Read before implementation decisions |
| `docs/phase-28-enterprise-architecture-proposal.md` | Completed | Read before implementation decisions |
| `docs/phase-28-development-roadmap.md` | Completed | Read before implementation decisions |
| `docs/phase-28-owner-decision-register.md` | Completed | Read before implementation decisions |
| Existing Phase 28B documents | Completed | Read approval, ADR, component UX, design system, readiness gate |
| Existing Phase 28C documents | Completed | Read completion checklist and stabilization report |
| Existing Phase 28D documents | Completed | Read implementation report |

## Scope Decision

| Requirement | Status | Evidence / Notes |
| --- | --- | --- |
| Implement all core School ERP modules except Transport | In Progress | Transport is excluded from Phase 29 implementation |
| Defer Transport | Deferred with Approval | Explicitly directed by Project Owner in Phase 29 prompt |
| Do not implement routes | Deferred with Approval | Transport route planning excluded |
| Do not implement stops | Deferred with Approval | Transport stops excluded |
| Do not implement vehicles | Deferred with Approval | Transport vehicles excluded |
| Do not implement drivers | Deferred with Approval | Transport drivers excluded |
| Do not implement GPS tracking | Deferred with Approval | Transport GPS excluded |
| Do not implement transport fees | Deferred with Approval | Transport fees excluded |
| Do not implement vehicle maintenance | Deferred with Approval | Transport maintenance excluded |
| Transport must not appear as a working menu item | Not Started | Must be verified in navigation |
| Hide Transport completely, disabled feature flag, or roadmap only | Not Started | Approved approaches documented |
| Do not create broken Transport placeholders | In Progress | No Transport code created |

## Implementation Order

| Step | Requirement | Status |
| --- | --- | --- |
| 1 | Audit current Phase 28B-D implementation changes | Completed |
| 2 | Reconcile and preserve valid existing work | Completed |
| 3 | Complete design tokens and shared UI architecture | In Progress |
| 4 | Stabilize authentication and role routing | Not Started |
| 5 | Fix Create School and Super Admin CRUD | Completed, not Verified |
| 6 | Complete School Admin core setup | Not Started |
| 7 | Complete role-specific dashboards with real data | Not Started |
| 8 | Complete Admissions | Not Started |
| 9 | Complete Academic setup | Not Started |
| 10 | Complete Student and Parent workflows | Not Started |
| 11 | Complete Attendance | Not Started |
| 12 | Complete Examination | Not Started |
| 13 | Complete Finance | Not Started |
| 14 | Complete HR and Payroll | Not Started |
| 15 | Complete Library | Not Started |
| 16 | Complete LMS | Not Started |
| 17 | Complete Communication | Not Started |
| 18 | Complete Reports and analytics | Not Started |
| 19 | Complete dark mode and accessibility | Not Started |
| 20 | Complete tests and production validation | Not Started |

## Design Direction

| Requirement | Status | Notes |
| --- | --- | --- |
| Use left navigation sidebar | Completed | Implemented in `AppShell`; browser visual verification still pending |
| Use top header | Completed | Implemented in `AppShell`; browser visual verification still pending |
| Use global search | Completed | Shell search field added; search execution is not yet wired |
| Use notifications | In Progress | Notification button added; notification center is not yet wired |
| Use user profile menu | In Progress | User menu surface added; menu actions are not yet wired |
| Use quick-action cards | Not Started | Required per dashboard |
| Use KPI cards | Not Started | Required per dashboard |
| Use charts | Not Started | Must use real API data and text summaries |
| Use recent activity | Not Started | Must use real API data |
| Use operational alerts | Not Started | Must use real API data |
| Use role-based dashboards | Not Started | Must not be generic repeated dashboards |
| Create original modern enterprise dashboard | Not Started | Do not copy dated visual references |
| Clean white/light surfaces | Completed | Token and shell surfaces updated |
| Professional navy/deep neutral foundation | Completed | Light/dark neutral tokens added |
| Controlled semantic accent colors | Completed | Semantic tokens expanded |
| Consistent spacing | In Progress | Shell controls normalized; module pages still pending |
| Strong typography hierarchy | In Progress | Shell and Create School form updated; dashboards pending |
| Limited gradients | Completed | Body gradient removed |
| No excessive shadows | Completed | Subtle tokenized shadows added |
| No rainbow dashboard appearance | Not Started | Token requirement |
| No oversized decorative cards | Not Started | Token requirement |
| No static fake data | Not Started | Dashboard data must come from real APIs |
| No generic repeated dashboard for every role | Not Started | Role-specific dashboard requirement |

## Core Layout

| Requirement | Status |
| --- | --- |
| Desktop collapsible left sidebar | Completed |
| Desktop sticky top navigation | Completed |
| Desktop global search | Completed |
| Desktop school switcher where authorized | In Progress |
| Desktop campus switcher where authorized | Not Started |
| Desktop notifications | In Progress |
| Desktop user menu | In Progress |
| Desktop breadcrumbs | Completed |
| Desktop 12-column responsive grid | Completed |
| Tablet collapsible sidebar | In Progress |
| Tablet responsive card grid | In Progress |
| Tablet scroll-safe tables | Not Started |
| Mobile drawer navigation | Completed |
| Mobile compact top bar | Completed |
| Mobile one-column cards | Not Started |
| Mobile responsive tables or card lists | Not Started |
| Mobile minimum 44px touch targets | In Progress |

## Enterprise Design System

| Requirement | Status | Notes |
| --- | --- | --- |
| Reusable token-based design system | In Progress | CSS and Tailwind tokens expanded; reusable component package still pending |
| Light theme | Completed | Tokenized light defaults added |
| Dark theme | Completed | Explicit dark tokens added |
| System preference theme | Completed | `theme-system` added with `prefers-color-scheme` |
| High-contrast readiness | Completed | `prefers-contrast: more` focus/border support added |
| Reduced-motion support | Completed | `prefers-reduced-motion` support added |
| Persist theme preference | Completed | Shell persists `erp-theme` in local storage |
| Dark mode not simple inversion | Completed | Explicit dark token values added |
| Semantic primary color | Completed | Required |
| Semantic secondary color | Completed | Required |
| Semantic information color | Completed | Required |
| Semantic success color | Completed | Required |
| Semantic warning color | Completed | Required |
| Semantic error color | Completed | Required |
| Semantic neutral color | Completed | Required |
| Semantic surface color | Completed | Required |
| Semantic elevated surface color | Completed | Required |
| Semantic muted surface color | Completed | Required |
| Semantic border color | Completed | Required |
| Semantic focus ring color | Completed | Required |
| Super Admin accent violet | Completed | Shared role theme updated and tested |
| School Admin accent blue | Not Started | Required |
| Teacher accent green | Not Started | Required |
| Student accent orange | Not Started | Required |
| Parent accent rose | Completed | Shared role theme updated and tested |
| Finance accent amber | Not Started | Required |
| HR accent warm neutral | Not Started | Required |
| Librarian accent teal | Not Started | Required |
| Admissions accent cyan | In Progress | CSS token exists; role is not yet implemented |
| Role accents only decorate context; semantic status colors remain stable | In Progress | Token separation added |

## Required Reusable Components

| Component | Status |
| --- | --- |
| AppShell | Completed |
| Sidebar | Completed |
| Topbar | Completed |
| MobileNav | Completed |
| Breadcrumbs | Completed |
| Search | In Progress |
| CommandPalette | Not Started |
| NotificationCenter | Not Started |
| UserMenu | In Progress |
| SchoolSwitcher | In Progress |
| CampusSwitcher | Not Started |
| ThemeToggle | Completed |
| PageHeader | Not Started |
| QuickAction | Not Started |
| MetricCard | Not Started |
| TrendCard | Not Started |
| ChartCard | Not Started |
| DataTable | Not Started |
| FilterBar | Not Started |
| SavedView | Not Started |
| BulkActionBar | Not Started |
| Pagination | Not Started |
| EmptyState | Not Started |
| ErrorState | Not Started |
| LoadingSkeleton | Not Started |
| PermissionDenied | Not Started |
| FormSection | Not Started |
| Modal | Not Started |
| Drawer | Not Started |
| ConfirmationDialog | Not Started |
| DestructiveConfirmation | Not Started |
| Toast | Not Started |
| InlineAlert | Not Started |
| ActivityFeed | Not Started |
| AuditTimeline | Not Started |
| ExportDialog | Not Started |
| ImportWizard | Not Started |
| Do not duplicate components independently per module | Not Started |

## Dashboard Foundation Requirements

| Requirement | Status |
| --- | --- |
| Every dashboard role-specific | Not Started |
| Every dashboard uses real APIs | Not Started |
| No hardcoded dashboard metric values | Not Started |
| Every metric has backend endpoint or aggregate query | Not Started |
| Every metric has permission check | Not Started |
| Every metric has school/campus scope | Not Started |
| Every metric has loading state | Not Started |
| Every metric has empty state | Not Started |
| Every metric has error state | Not Started |
| Last updated indicator where useful | Not Started |
| Accessible textual chart interpretation | Not Started |

## Role Dashboards

| Dashboard | Required content | Status |
| --- | --- | --- |
| Super Admin | Total schools, active schools, suspended schools, campuses, users, students, staff, new schools this period, onboarding status, platform usage, tenant health, administrator activity, security alerts, failed operations, audit activity, school growth chart, users by role, schools by status, quick actions | In Progress | Route matrix added; visible cards/charts/activity now use real dashboard API data |
| Super Admin Create School | Fully functional create school flow | Completed, not Verified |
| School Admin | Students, teachers, staff, classes, attendance today, pending admissions, fees collected, outstanding fees, upcoming exams, leave requests, activity, attendance trends, fee collection trends, class distribution, quick actions | Not Started |
| Teacher | Today's classes, attendance pending, assignments to grade, upcoming exams, announcements, class attendance trends, performance summary, curriculum progress, quick actions | Not Started |
| Student | Attendance percentage, classes today, assignments due, results, fee status, announcements, upcoming exams, learning progress, timetable, quick actions | Not Started |
| Parent | Multi-child switcher, child attendance, performance, outstanding fees, results, homework, announcements, messages, meetings, quick actions | Not Started |
| Finance | Total billed, collected, outstanding, overdue invoices, discounts, scholarships, refunds, daily collection, payment method breakdown, aging, transactions, quick actions | Not Started |
| HR | Employees, present/absent today, leave, contracts expiring, payroll, department distribution, attendance trends, HR activity, quick actions | Not Started |
| Librarian | Titles, copies, issued, overdue, reservations, fines, popular books, issues/returns, quick actions | Not Started |
| Admissions | Inquiries, applications, review, accepted, rejected, waitlisted, conversion, funnel, source attribution, missing documents, interviews, quick actions | Not Started |

## Core Functional Modules

| Module | Required workflows | Status |
| --- | --- | --- |
| Super Admin | Schools, campuses, school administrators, user management, roles, permissions, feature flags, system settings, audit logs, security events, platform announcements | In Progress | Schools, campuses, administrators stabilized; remaining Super Admin areas still pending |
| Admissions | Inquiries, applications, stages, document checklist, interviews, assessments, offers, rejections, waitlist, enrollment conversion, reporting | Not Started |
| Academic | Academic years, terms, classes, sections, subjects, curriculum, timetables, rooms, teacher allocation, academic calendar | Not Started |
| Student Information | Profile, guardians, parent-child relationship, documents, enrollment, class assignment, school history, promotion, transfer readiness, status history | Not Started |
| Attendance | Student, teacher, staff, daily, period, bulk, late, early departure, absence reasons, correction workflow, reports | Not Started |
| Examination | Exam types, schedules, question bank, marks entry, grade scales, publication, report cards, transcripts, recheck workflow, analytics | Not Started |
| LMS | Courses, lessons, materials, assignments, submissions, grading, quizzes, progress, calendar, notifications | Not Started |
| Finance | Fee structures, categories, invoices, installments, discounts, scholarships, fines, payments, receipts, refunds, reconciliation, income, expenses, reports, approvals | Not Started |
| HR and Payroll | Employees, departments, designations, contracts, attendance, leave, salary structures, allowances, deductions, payroll, payslips, performance, documents | Not Started |
| Library | Books, authors, publishers, categories, copies, issue, return, renewal, reservation, fine, lost/damaged, stock verification, reports | Not Started |
| Communication | Announcements, in-app notifications, email templates, SMS readiness, parent-teacher communication, broadcasts, delivery status, preferences | Not Started |
| Reports | Student, attendance, examination, fee, finance, HR, library, multi-school, CSV, Excel, PDF readiness, permission-scoped reporting | Not Started |

## Data Table Requirements

| Requirement | Status |
| --- | --- |
| Enterprise pages are not card-only | Not Started |
| Search | In Progress |
| Filters | In Progress |
| Advanced filters | Not Started |
| Sorting | In Progress |
| Pagination | In Progress |
| Column visibility | Not Started |
| Saved views | Not Started |
| Bulk selection | Not Started |
| Bulk actions | Not Started |
| Export | Not Started |
| Empty state | In Progress |
| Loading skeleton | In Progress |
| Error state | In Progress |
| Row action menu | In Progress |
| Mobile fallback | Not Started |
| Server-side pagination for large lists | Not Started |

## Forms and CRUD Requirements

| Requirement | Status |
| --- | --- |
| Fix Create School and currently non-working CRUD actions first | Completed, not Verified |
| Do not build dashboards before critical CRUD foundation works | Completed |
| Zod validation | Completed, not Verified | Route parity and administrator payload covered by focused web regression |
| Shared schemas | Completed, not Verified | School/campus/administrator schemas updated |
| Server-side validation | Completed, not Verified | Backend routes use shared schemas; API typecheck blocked locally |
| Inline field errors | Completed, not Verified |
| Error summary | Completed, not Verified |
| Loading state | Completed, not Verified |
| Disabled submit during request | Completed, not Verified |
| Success toast | Not Started |
| Failure toast | Not Started |
| Confirmation for destructive actions | Completed, not Verified |
| Unsaved-change warning | Not Started |
| Accessible labels | In Progress |
| Keyboard support | In Progress |
| Tenant validation | In Progress |
| Audit logging | Completed, not Verified |

## Multi-Tenancy

| Requirement | Status |
| --- | --- |
| All school-scoped queries verify `schoolId` | Not Started |
| All applicable queries verify `campusId` | Not Started |
| Verify authenticated user membership | Not Started |
| Verify role | Not Started |
| Verify permission | Not Started |
| Verify record ownership | Not Started |
| Super Admin may access multiple schools | Not Started |
| School Admin cannot access another school | Not Started |
| Teachers only access assigned classes/students | Not Started |
| Parents only access linked children | Not Started |
| Students only access own records | Not Started |
| Add tests for cross-tenant access attempts | Not Started |

## Security

| Requirement | Status |
| --- | --- |
| Maintain JWT authentication | In Progress |
| Maintain refresh token support | Not Started |
| Maintain secure cookies through frontend proxy | In Progress |
| Maintain server-side permission checks | In Progress |
| Maintain Helmet | In Progress |
| Maintain CORS | In Progress |
| Maintain request IDs | In Progress |
| Maintain audit logs | In Progress |
| Add or complete login rate limiting | Not Started |
| Add or complete brute-force protection | Not Started |
| Add or complete secure error handling | Not Started |
| Add or complete input validation | Not Started |
| Add or complete object-level authorization | Not Started |
| Add or complete export authorization | Not Started |
| Add or complete file validation | Not Started |
| Add or complete sensitive log redaction | Not Started |
| Add or complete session expiry handling | Not Started |
| Add or complete permission-denied UI | Not Started |
| Do not expose secrets to frontend | In Progress |

## Low-Memory Execution Rules

| Requirement | Status |
| --- | --- |
| Do not run `npm ci` | In Progress |
| Do not run full reinstall | In Progress |
| Do not delete `node_modules` | In Progress |
| Do not run `npm cache clean` | In Progress |
| Do not run `npm run dev` | In Progress |
| Do not run watch-mode commands | In Progress |
| Do not run parallel builds | In Progress |
| Do not run multiple test suites together | In Progress |
| Reuse `node_modules` | In Progress |
| Reuse `package-lock.json` | In Progress |
| Reuse Prisma Client | In Progress |
| Reuse workspace dist folders | In Progress |
| Reuse build caches | In Progress |
| Run one heavy command at a time | In Progress |
| Prefer targeted checks in order shared, ui, api, web | In Progress |
| Run full root build only once at final validation | Not Started |
| Use `NODE_OPTIONS=--max-old-space-size=1536` | Completed |
| Provide memory-heavy commands for owner to run manually where needed | In Progress |

## Per-Module Validation Requirement

| Requirement | Status |
| --- | --- |
| Typecheck affected workspace after each module | In Progress |
| Run targeted tests only after each module | In Progress |
| Verify API routes after each module | In Progress | Frontend/backend route parity covered by `npm run test --workspace @school-erp/web` |
| Verify permissions after each module | In Progress | Backend route middleware present; runtime API tests blocked locally |
| Verify school isolation after each module | Not Started |
| Verify database operation after each module | In Progress |
| Verify loading/error/empty states after each module | Completed, not Verified |
| Update checklist after each module | In Progress |

## Final Validation Requirement

| Requirement | Status |
| --- | --- |
| Run `npm run build` once at final stage | Not Started |
| Run targeted unit tests | Not Started |
| Run targeted integration tests | Not Started |
| Run critical role E2E tests | Not Started |
| Run production route smoke tests | Not Started |

## Critical Acceptance Tests

| Acceptance test | Status |
| --- | --- |
| Super Admin creates school | Completed, not Verified |
| Super Admin creates school administrator | Completed, not Verified |
| School Admin creates academic year | Not Started |
| School Admin creates class and section | Not Started |
| Admissions creates and enrolls student | Not Started |
| Parent-child relationship works | Not Started |
| Teacher marks attendance | Not Started |
| Teacher enters marks | Not Started |
| Result is published | Not Started |
| Student views result | Not Started |
| Parent views child result | Not Started |
| Finance creates invoice and records payment | Not Started |
| HR creates employee and leave request | Not Started |
| Librarian issues and returns book | Not Started |
| Unauthorized role receives 403 | Not Started |
| Cross-school access is blocked | Not Started |
| Dark mode works | Completed, not Verified |
| Mobile navigation works | Completed, not Verified |
| Production build passes | Not Started |

## Git Rules

| Requirement | Status |
| --- | --- |
| Do not run `git add .` | In Progress |
| Stage related files explicitly | Not Started |
| Separate documentation commits | Not Started |
| Separate design system commits | Not Started |
| Separate authentication/routing commits | Not Started |
| Separate Super Admin CRUD commits | Not Started |
| Separate dashboard API commits | Not Started |
| Separate dashboard UI commits | Not Started |
| Separate major module commits | Not Started |
| Separate tests commits | Not Started |
| Do not push until current milestone validation passes | In Progress |
| Do not commit `.env`, tokens, or database URLs | In Progress |

## Required Final Report

| Requirement | Status |
| --- | --- |
| Create `docs/phase-29-enterprise-dashboard-completion-report.md` | In Progress |
| Include checklist status | In Progress |
| Include files changed | In Progress |
| Include components created | In Progress |
| Include APIs created | In Progress |
| Include Prisma changes | In Progress |
| Include migrations | In Progress |
| Include working CRUD flows | In Progress |
| Include working role dashboards | In Progress |
| Include deferred items | In Progress |
| Include tests executed | In Progress |
| Include passed tests | In Progress |
| Include failed tests | In Progress |
| Include unverified items | In Progress |
| Include performance findings | In Progress |
| Include accessibility findings | In Progress |
| Include security findings | In Progress |
| Include git status | In Progress |
| Include exact commits | In Progress |
| Include production deployment steps | In Progress |
| Do not claim enterprise readiness unless critical acceptance tests passed | In Progress |
