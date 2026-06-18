# Phase 28A Enterprise Architecture Proposal

No implementation is approved in Phase 28A. This proposal is for Project Owner review.

## Target Frontend Architecture

- Next.js App Router retained.
- Role portals remain first-class, but module workflows move to shared page templates.
- Use server proxy routes `/api/*` only as the browser-to-backend boundary.
- Introduce shared UI package components:
  - App shell, role navigation, mobile navigation, breadcrumbs.
  - Data table, forms, filters, saved views, dialogs, drawers, toasts.
  - Permission denied, loading, error, empty, offline, skeleton states.
- Introduce route-policy metadata shared by navigation and tests.
- Keep role accenting controlled by design tokens.
- Add i18n-ready string strategy and theme persistence per user.

## Target Backend Architecture

- Retain Express + TypeScript + Prisma.
- Preserve `/health`, `/v1`, default-exported Express app, and Vercel root.
- Split route handlers into:
  - Controllers: HTTP mapping only.
  - Services: domain workflow/transaction logic.
  - Repositories/query services: Prisma access.
  - Policy service: authentication, role, permission, tenant, object scope.
  - Audit service: required audit events.
- Replace broad module permissions with action permissions.
- Add idempotency support for imports, payments, notifications, and webhooks.

## Target Database Architecture

- Add `Campus`.
- Add durable relationships:
  - User to staff/teacher/student/parent profiles.
  - Parent-child relationship table.
  - Teacher-class-subject assignments.
  - Campus memberships.
- Add soft-delete/lifecycle state standards.
- Add audit-history tables for sensitive workflows.
- Add indexes around school/campus/status/date/person.
- Assess PostgreSQL RLS after app-level tenant policy is centralized.

## Target Module Architecture

Core modules:

1. Platform administration and tenant lifecycle.
2. Identity, roles, permissions, sessions, audit.
3. School/campus setup.
4. SIS.
5. Academic structure.
6. Admissions.
7. Attendance.
8. Exams and gradebook.
9. LMS.
10. Fees and finance.
11. HR and payroll.
12. Library.
13. Communication.
14. Reports and analytics.
15. Documents and certificates.

Optional modules are phased later: transport, hostel, cafeteria, inventory, procurement, events, discipline, counseling, clinic, visitor/front desk, alumni, fundraising, facilities, help desk.

## Target Design-System Architecture

Foundation tokens:

- Brand colors, semantic colors, role accents, neutral scale.
- Success, warning, error, information.
- Background, surface, border, text hierarchy.
- Typography, spacing, radius, elevation, motion, z-index, breakpoints.
- Chart and status palettes.

Themes:

- Light, dark, system, high contrast, reduced motion.

Component families:

- App shell, nav, command/search, switchers, notifications, tasks.
- Cards, charts, tables, filters, saved views, bulk actions.
- Forms, stepper forms, date/time/select/combobox/file/rich text.
- Modal/drawer/popover/tooltip/tabs/accordion.
- Timeline/activity/audit history.
- Alerts/toasts/states/export/import/print.

Each component must support dark theme, keyboard, screen reader semantics, responsive behavior, loading/disabled/error states, and tests.

## Target Workflow Architecture

Introduce reusable workflow engine with:

- States: draft, submitted, under review, approved, rejected, returned, cancelled, escalated.
- Approvers and approval levels.
- Comments, attachments, deadlines, escalations.
- Notifications, history, and audit trail.

Candidate workflows:

- Admission approval, student transfer/promotion.
- Fee discount/refund/expense approval.
- Leave and attendance correction.
- Marks correction/result publication.
- Document verification, payroll, purchase, access request, data export.

## Target Notification Architecture

- Provider adapter pattern for email, SMS, push, WhatsApp readiness.
- Templates and notification preferences.
- Delivery status, retries, scheduled jobs, emergency alerts.
- Audit trail and provider health checks.
- Secrets isolated outside source control.

## Target Reporting Architecture

- Role dashboards and operational dashboards.
- Filterable and saved reports.
- Scheduled reports.
- CSV, Excel, PDF, print.
- PII masking and data-access permissions.
- Report audit logs.
- Accessible charts with textual summaries.

## Target Observability Architecture

- Structured logs with request IDs.
- Audit logs separated from technical logs.
- Error tracking.
- API and DB latency metrics.
- Slow-query monitoring.
- Job/queue monitoring.
- Uptime, deployment, provider, database, storage health.
- Security events and alerting.
- Backup and restore verification dashboard.

## Security Architecture Recommendations

- Optional 2FA with recovery codes.
- OIDC/SAML SSO readiness.
- Session/device management.
- Login history and security alerts.
- Step-up auth for destructive or sensitive actions.
- Super Admin impersonation with mandatory audit evidence.
- Break-glass access policy with dual approval and expiration.
