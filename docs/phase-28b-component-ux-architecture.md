# Phase 28B Component and UX Architecture

Status: Proposed for Project Owner approval.

## Product Information Architecture

The app should move from repeated tabbed CRUD portals to workflow-oriented role portals.

Target navigation levels:

1. Role portal home.
2. Module landing page.
3. Entity list or workflow queue.
4. Entity detail.
5. Action panel, wizard, modal, or drawer.

## App Shell

Required shell regions:

- Sidebar for desktop.
- Top bar for context, search, notifications, and account actions.
- Mobile navigation drawer or bottom navigation.
- Breadcrumbs in the main content area.
- School and campus switchers where authorized.
- Role switcher only when the user has multiple authorized roles.
- Skip link before navigation.

Current gap:

- `AppShell` is useful but desktop-first and lacks top bar, mobile drawer, breadcrumbs, switchers, notification center, task center, and command palette.

## Role Portal Home Templates

| Portal | Primary home content |
| --- | --- |
| Super Admin | Tenant health, school lifecycle, subscription health, security events, failed jobs, platform metrics |
| School Admin | Campus health, student/staff counts, attendance risks, fee collection, pending approvals, alerts |
| Teacher | Today schedule, assigned classes, attendance tasks, grading queue, messages, upcoming assessments |
| Student | Timetable, assignments due, attendance, results, fees, announcements |
| Parent | Child switcher, attendance alerts, assignments, fee invoices, messages, meetings |
| Finance | Collections, outstanding balances, reconciliation tasks, approvals, reports |
| HR | Staff attendance, leave approvals, payroll tasks, compliance expiries |
| Librarian | Circulation queue, overdue books, reservations, catalog tasks |
| Admissions | Inquiry pipeline, applications by stage, document checks, interviews, conversion funnel |

## Entity List Template

Required regions:

- Page title and primary action.
- Breadcrumbs.
- Search.
- Saved views.
- Filter panel.
- Status tabs where useful.
- Data table.
- Bulk action bar.
- Pagination.
- Export/import entry points.
- Empty/error/loading states.

Required behaviors:

- Server-side pagination.
- Sort state in URL.
- Filters in URL.
- Selection state isolated to visible result set unless explicitly selecting all filtered rows.
- Permission-aware actions backed by server-side enforcement.

## Entity Detail Template

Required regions:

- Summary header.
- Status and lifecycle actions.
- Primary facts.
- Tabs for details, related records, documents, activity, audit history.
- Contextual action drawer.
- Permission-denied states for restricted tabs.

## Workflow Queue Template

Required columns:

- Item.
- Current state.
- Requester.
- Assignee.
- Due date or SLA.
- Risk/priority.
- Last activity.
- Available action.

Required behaviors:

- Approve, reject, return, cancel, escalate.
- Comment with attachments.
- Audit trail.
- Notifications.

## Forms Architecture

Required form patterns:

- Single-section form for simple entities.
- Multi-section form for profiles and settings.
- Stepper form for admissions, imports, onboarding, fee setup.
- Inline validation.
- Error summary.
- Save draft where workflow supports draft.
- Confirm navigation away with unsaved changes.
- Field-level help only where necessary.

Current gap:

- Many forms are generated from object keys and do not provide domain-specific control types, validation messages, relationship pickers, or error summaries.

## Data Table Architecture

Required table features:

- Accessible name or caption.
- Sort.
- Search.
- Filters.
- Saved views.
- Pagination.
- Column visibility.
- Row actions.
- Bulk actions.
- Export.
- Empty/loading/error states.
- Responsive fallback.
- Virtualization for large lists.

Current gap:

- Current tables are usable as scaffolds but lack edit actions, confirmation, saved views, column controls, bulk actions, and strong accessibility affordances.

## Confirmation and Destructive Actions

Rules:

- Destructive actions require a confirmation dialog.
- High-impact actions require typed confirmation or step-up authentication.
- Delete should be soft-delete or lifecycle transition when records have history.
- Confirmation text must include the object name and consequence.

High-impact examples:

- Delete or archive school.
- Restore backup.
- Cancel subscription.
- Publish results.
- Approve payroll.
- Export PII.
- Impersonate user.

## Empty, Error, Loading, and Permission States

Each module must define:

- First-use empty state.
- No-results empty state.
- Permission-denied state.
- Inline field error.
- Page-level error.
- Retry state.
- Skeleton loading state.
- Slow-network state where useful.

## Mobile and Tablet Architecture

Required:

- Mobile app shell.
- Collapsible navigation.
- Touch targets at least 44px where possible.
- Tables convert to cards or maintain usable horizontal scroll with sticky key column.
- Forms avoid two-column layouts on mobile.
- Primary actions remain reachable without covering content.

## Internationalization Architecture

Target:

- Translation keys for all new presentation strings.
- Locale-aware dates, times, numbers, and currencies.
- School-specific timezone.
- RTL-ready layout rules.
- Localized validation messages.
- Localized notification/report/document templates.

Do not hardcode new architecture text into reusable components.

## Accessibility QA Contract

Every new shared component requires:

- Keyboard test.
- Screen-reader semantics review.
- Focus-visible verification.
- Reduced-motion behavior.
- Contrast check in light and dark modes.
- Responsive reflow check.

No page template can be marked enterprise-ready without this contract.

