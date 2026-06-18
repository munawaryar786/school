# Phase 28B Design-System Specification

Status: Proposed for Project Owner approval.

The current app already uses Tailwind, CSS variables, role theme classes, and `lucide-react`. Phase 28B standardizes that direction into an enterprise design system rather than replacing it.

## Design Principles

1. Build an operational ERP interface, not a marketing site.
2. Use one enterprise design system with role accents.
3. Keep semantic colors stable across roles.
4. Prefer dense, scannable, repeatable workflows over decorative layouts.
5. Design accessibility into every component from the start.
6. Make mobile and tablet workflows first-class, not afterthoughts.
7. Make empty, loading, error, permission-denied, and offline states standard.

## Token Architecture

### Core Tokens

| Token family | Purpose |
| --- | --- |
| Brand | Product identity and primary brand surfaces |
| Neutral | Text, surfaces, borders, disabled controls |
| Semantic | Success, warning, error, information |
| Role accent | Controlled role-specific emphasis |
| Background | Page and app shell layers |
| Surface | Cards, panels, table rows, raised regions |
| Border | Default, strong, subtle, focus, danger |
| Text | Primary, secondary, muted, disabled, inverse |
| Typography | Font family, sizes, weights, line heights |
| Spacing | Layout and component rhythm |
| Radius | Control, panel, modal, table, pill |
| Elevation | Shadow levels and focus rings |
| Motion | Duration, easing, reduced-motion variants |
| Z-index | Header, sidebar, overlay, modal, toast |
| Breakpoints | Mobile, tablet, desktop, wide |
| Chart | Accessible categorical and sequential palettes |
| Status | Active, draft, pending, approved, rejected, archived |

### Semantic Color Rules

| Meaning | Color family | Rule |
| --- | --- | --- |
| Danger/error/destructive | Red | Never replaced by role accent |
| Success/complete/paid | Green | Never replaced by role accent |
| Warning/attention/pending risk | Yellow or amber | Never replaced by role accent |
| Information/help/system notice | Blue | Stable across roles |
| Role identity | Role accent | Used for nav highlights, selected tabs, role badges, accents |

## Role Accent Strategy

| Role | Accent | Current code gap |
| --- | --- | --- |
| Super Admin | Violet | Current uses purple, acceptable but rename to violet in docs/tokens |
| School Admin | Blue | Present |
| Teacher | Green | Present |
| Student | Orange | Present |
| Parent | Rose | Current uses pink, should standardize to rose |
| Finance | Amber | Current maps finance to school-admin blue |
| HR | Warm neutral/brown | Current maps HR to school-admin blue |
| Library | Teal | Current maps to `theme-academic`, acceptable short term but should get library token |
| Admissions | Cyan | Missing role and token |
| Staff | Configurable or school-admin blue | Current maps to school-admin blue |

## Theme Modes

Required modes:

- Light.
- Dark.
- System.
- High contrast.
- Reduced motion.

Persistence:

- Theme mode is stored per user.
- Temporary local preference may be used before profile persistence exists.
- Server-rendered shell should avoid theme flash when practical.

Dark mode:

- Use explicit dark values for every semantic token.
- Do not invert light mode colors.
- Test role accents separately in light and dark mode.

High contrast:

- Increase text and border contrast.
- Preserve semantic color meaning.
- Make focus indicators stronger.

Reduced motion:

- Remove nonessential animations.
- Preserve state changes without relying on motion.

## Typography

Recommended scale:

| Token | Use |
| --- | --- |
| `text-xs` | Metadata, table helper text, compact labels |
| `text-sm` | Default controls, tables, body text in dense UI |
| `text-base` | Section headings, readable paragraph text |
| `text-lg` | Panel headings |
| `text-xl` | Page subsection headings |
| `text-2xl` | Page titles in dense pages |
| `text-3xl` | Portal landing title only |

Rules:

- No viewport-width font scaling.
- Letter spacing stays normal except small uppercase metadata.
- Tables and sidebars must avoid oversized type.

## Radius and Elevation

| Token | Value intent |
| --- | --- |
| `radius-control` | 6px |
| `radius-panel` | 8px |
| `radius-dialog` | 8px |
| `radius-pill` | Full only for badges/pills |
| `shadow-panel` | Subtle operational surface |
| `shadow-popover` | Overlay elevation |
| `shadow-modal` | Strong overlay elevation |
| `shadow-focus` | Accessible focus ring |

Cards should not nest inside page-section cards. Use cards only for repeated items, tools, dialogs, and framed controls.

## Component Requirements

Every shared component must define:

- Light theme.
- Dark theme.
- High-contrast behavior.
- Keyboard support.
- Screen-reader semantics.
- Responsive behavior.
- Loading state.
- Disabled state.
- Error state.
- Test coverage.

## Component Families

Phase 28B approved target families:

- App shell.
- Sidebar.
- Top navigation.
- Mobile navigation.
- Breadcrumbs.
- Command palette.
- Global search.
- User menu.
- School switcher.
- Campus switcher.
- Role switcher where authorized.
- Notification center.
- Task center.
- Dashboard cards.
- Metric cards.
- Trend cards.
- Chart containers.
- Data tables.
- Virtualized tables.
- Filters.
- Advanced filters.
- Saved views.
- Bulk action bars.
- Pagination.
- Sort controls.
- Forms.
- Form sections.
- Stepper forms.
- Date pickers.
- Time pickers.
- Select controls.
- Comboboxes.
- Multi-select.
- File upload.
- Document preview.
- Rich text editor.
- Modal.
- Drawer.
- Popover.
- Tooltip.
- Tabs.
- Accordion.
- Timeline.
- Activity feed.
- Audit history.
- Toast notifications.
- Inline alerts.
- Empty states.
- Error states.
- Loading skeletons.
- Confirmation dialogs.
- Destructive confirmation.
- Permission-denied state.
- Offline or retry state.
- Export dialog.
- Import wizard.
- Print layouts.

## Accessibility Baseline

Target: WCAG 2.2 AA.

Baseline rules:

- Use semantic HTML first.
- Use ARIA only where native semantics are insufficient.
- Every input has a visible label or an accessible name.
- Errors are associated with fields.
- Complex forms include error summaries.
- Keyboard users can reach and operate all controls.
- Focus is visible and restored after dialogs/drawers.
- Destructive actions require confirmation.
- Charts include text summaries.
- Tables support captions or accessible names.
- Motion respects reduced-motion preference.

## Implementation Sequence

Phase 28C should implement design-system foundations in this order:

1. Token map and theme provider.
2. App shell responsive navigation.
3. State components.
4. Form primitives.
5. Data table primitives.
6. Dialog/drawer/toast primitives.
7. Dashboard/card/chart containers.
8. Import/export and workflow components.

No business module should be rewritten before the token and component foundation is stable.

