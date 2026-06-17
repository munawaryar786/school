# Phase 28A UI and UX Audit

## Current UI Findings

The frontend is a real Next.js application with protected routes, an app shell, role navigation, login, and module pages. Most modules use repeated CRUD workspace patterns: header, horizontal tabs, toolbar with search/status/export, create form, table, pagination, and delete action.

Strengths:

- Consistent basic layout and role theme classes.
- Real fetch calls to `/api/*` proxy routes.
- Loading, empty, and error text states exist in many components.
- Tables are horizontally scrollable.
- Icons from `lucide-react` are used.
- Forms have visible labels.

Weaknesses:

- The product currently feels like repeated CRUD scaffolding rather than role-specific ERP workflows.
- Many pages have hardcoded starter form values.
- No edit action is visible in sampled tables even though backend supports PATCH.
- Delete actions lack confirmation and impact messaging.
- No global search, command palette, school/campus switcher, notification center, task center, or saved views.
- Mobile navigation is weak; the sidebar is always present in the app shell layout and no dedicated mobile navigation was inspected.
- Cards, toolbars, tables, and forms are duplicated across portal files.
- Text and strings are hardcoded; no i18n architecture was observed.
- Student page includes mojibake `Â·`, indicating encoding/presentation quality issues.

## Navigation Findings

Current navigation is role-based but shallow. Many links point to the same page:

- Super Admin links like Schools, Audit, Settings point to `/super-admin`.
- Teacher links like Classes and Attendance point to `/teacher`.
- Student links like Assignments and Results point to `/student`.
- Parent links like Children and Fees point to `/parent`.

This creates tabbed megascreens instead of clear workflows. Enterprise target should use:

- Role portal home.
- Module landing pages.
- Entity list pages.
- Entity detail pages.
- Task queues.
- Drill-down dashboards.
- Breadcrumbs and recent items.

## Responsive Findings

- Tables use `overflow-x-auto` and `min-w`, which prevents column collapse but creates horizontal scrolling.
- App shell uses a fixed desktop grid `lg:grid-cols-[280px_1fr]`.
- No inspected mobile bottom nav, drawer sidebar, or responsive command/navigation pattern.
- Touch target sizes are often 40-44px, but tabs and table icon buttons need systematic verification.

## Accessibility Findings

Positive:

- Many icons are marked `aria-hidden`.
- Navigation regions have labels.
- Login errors use `role="alert"`.
- Form fields have visible labels.

Gaps:

- No skip link inspected.
- No modal focus trap or focus restoration architecture.
- No error summary for forms.
- Delete icon buttons need contextual labels, not only generic `Delete`.
- Charts are mostly absent; future charts must include text summaries.
- Focus-visible styling depends on browser defaults or border color only.
- No high-contrast or reduced-motion mode architecture.
- No screen-reader announcements for async save/delete success.

Target: WCAG 2.2 AA must be designed into shared components before Phase 28D module buildout.

## Design-System Gaps

Current design system is mostly Tailwind tokens in global CSS plus role theme constants. `packages/ui` only exposes `cn`.

Missing:

- Tokenized semantic color system.
- Dark/high-contrast themes.
- Component primitives with accessibility contracts.
- Standard table, form, modal, drawer, toast, tabs, filter, pagination, confirmation, upload, and import/export components.
- Visual density and responsive rules.
- State patterns for empty/error/loading/skeleton/offline/permission denied.
- Testing harness for UI components.

## Proposed Role Accents

Use one unified enterprise system with controlled accents:

| Role | Accent |
| --- | --- |
| Super Admin | Violet |
| School Admin | Blue |
| Teacher | Green |
| Student | Orange |
| Parent | Rose |
| Finance | Amber |
| HR | Warm neutral/brown |
| Library | Teal |
| Admissions | Cyan |
| Configurable staff | Inherit school/admin accent unless explicitly configured |

Semantic colors must not change by role: red is danger/error, green is success, yellow/amber is warning, blue is information.

## Light and Dark Theme Proposal

Theme modes:

- Light.
- Dark.
- System.
- High contrast.
- Reduced motion.

Persist theme selection per user. Dark mode must use explicit semantic token values, not color inversion.

Required token families:

- Brand colors.
- Semantic colors.
- Role accent colors.
- Neutral scale.
- Success, warning, error, information.
- Background and surface layers.
- Borders.
- Text hierarchy.
- Typography, spacing, radius, elevation, motion, z-index, breakpoints.
- Chart palette and status palette.

## Component Inventory

Current reusable pieces:

- `AppShell`
- `LogoutButton`
- `LoginView`
- `FoundationDashboard`
- Portal-local repeated `Toolbar`, `FormPanel`, `DataTable`, `State`
- `cn` utility in `packages/ui`

Target component families:

- App shell, sidebar, top nav, mobile nav, breadcrumbs.
- Command palette, global search, user menu, school/campus/role switchers.
- Notification center and task center.
- Metric/trend/dashboard cards and chart containers.
- Data table and virtualized table.
- Filters, advanced filters, saved views, bulk action bars, pagination, sort controls.
- Form sections, stepper forms, inputs, selects, comboboxes, multiselect, date/time pickers.
- File upload, document preview, rich text editor.
- Modal, drawer, popover, tooltip, tabs, accordion.
- Timeline, activity feed, audit history.
- Toasts, inline alerts, empty/error/loading/permission/offline states.
- Export dialog, import wizard, print layouts.

Every component must define light/dark support, keyboard support, screen-reader semantics, responsive behavior, loading/disabled/error states, and test coverage.

## Recommended Page Templates

| Template | Use |
| --- | --- |
| Role dashboard | Persona-specific metrics, tasks, alerts, and recent activity |
| Entity list | Search, saved views, filters, table, bulk actions, import/export |
| Entity detail | Profile header, tabs, timeline, audit log, related records |
| Workflow queue | Pending approvals, SLA, owner, status transitions |
| Wizard | Admissions, import, school onboarding, fee setup |
| Report page | Filters, summaries, accessible charts, export/print |
| Settings page | Scoped configuration with change history |
| Permission denied | Explains missing permission and request-access path |
| Empty state | Next useful action, documentation link, required permission |
