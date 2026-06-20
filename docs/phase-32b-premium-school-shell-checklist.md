# Phase 32B Premium School Shell Checklist

Date: 2026-06-20
Branch: `phase-32-single-school-premium`
Scope: Premium school-facing shell, role dashboard foundations, module preview/status states, and validation. No full backend-heavy ERP modules in this pass.

Status legend: Pending, In Progress, Completed, Blocked.

## Mandatory Gate

| Requirement | Status | Notes |
| --- | --- | --- |
| Read Phase 32 UI reference analysis | Completed | Source direction reviewed before implementation. |
| Read Phase 32 market/research/role docs | Completed | Role matrix, roadmap, parent/student, library/reading, and differentiator docs reviewed. |
| Create/update this checklist before application code changes | Completed | This file was created before application code changes. |
| Create implementation report after work | Completed | See `docs/phase-32b-implementation-report.md`. |

## Phase 32B Scope

| Requirement | Status | Notes |
| --- | --- | --- |
| Premium school-facing shell | Completed | Existing `AppShell` improved; no duplicate shell added. |
| Sidebar scroll fix | Completed | Desktop sidebar is fixed-height with internal nav scroll and separate content scroll. |
| Clean profile/logout UX | Completed | Profile footer uses a compact dropdown; logout no longer sits over navigation. |
| Responsive topbar/mobile drawer | Completed | Topbar title/role/search/placeholder preserved; mobile drawer closes through backdrop, close button, or link. |
| School Admin premium dashboard | Completed | Hero, setup coach, action queue, full metrics, real charts, module hub, and activity panel added. |
| Teacher dashboard foundation | Completed | Shared role foundation uses `/api/teacher/dashboard` and safe empty/setup states. |
| Student dashboard foundation | Completed | Shared role foundation uses `/api/student/dashboard` and own-data empty/setup language. |
| Parent dashboard foundation | Completed | Shared role foundation uses `/api/parent/dashboard` and linked-child empty language. |
| Librarian dashboard foundation | Completed | Shared role foundation uses `/api/library/dashboard` and library setup/reading previews. |
| Finance dashboard foundation | Completed | Shared role foundation uses `/api/finance/dashboard` and real finance metric/empty states. |
| Module preview pages/states | Completed | School Admin in-shell module previews and status cards added; no new routes needed. |
| Setup Coach/smart empty states | Completed | School Admin setup dependencies use real available metric checks. |
| Module status cards | Completed | Ready, Setup Required, Preview, and Coming Later are used. Locked remains available in component typing for later use. |
| Real-data cards where backend exists | Completed | Existing frontend `/api/*/dashboard` proxy endpoints are used. |
| Empty/setup-required states where data is missing | Completed | Missing data renders safe zero or precise empty/setup messages. |

## Explicit Non-Scope

| Requirement | Status | Notes |
| --- | --- | --- |
| Do not implement full Admissions CRUD | Completed | Preview/status only. |
| Do not implement full Academic CRUD | Completed | Preview/status only. |
| Do not implement attendance marking workflow | Completed | Preview/status only. |
| Do not implement library issue/return workflow | Completed | Preview/status only in role foundation. |
| Do not implement parent leave backend workflow | Completed | Preview only. |
| Do not implement fees/payment workflow | Completed | Preview/status only. |
| Do not implement exams/results workflow | Completed | Preview/status only. |
| Do not implement LMS workflow | Completed | Preview/status only. |
| Do not implement reports export | Completed | Preview/status only. |
| Do not add payment gateway/notification provider/AI scoring | Completed | No providers or AI features added. |

## Premium School Shell

| Requirement | Status | Notes |
| --- | --- | --- |
| Dark professional desktop sidebar | Completed | Sidebar now uses a dark school-ops surface. |
| Sidebar internal scroll area | Completed | Navigation scrolls independently inside the sidebar. |
| Separate main content scroll | Completed | Main content owns its scroll on desktop. |
| Sticky bottom profile card | Completed | Profile card stays in the sidebar footer outside nav scroll. |
| Clean logout dropdown/control | Completed | Logout is inside profile dropdown and keyboard-accessible. |
| Logout dropdown does not cover sidebar text badly | Completed | Dropdown is in footer and does not overlay nav labels. |
| No transparent overlay over navigation | Completed | Mobile backdrop is outside drawer; desktop has no nav overlay. |
| Clear active navigation state | Completed | Active links use primary filled state in the sidebar. |
| Long school/user names truncate cleanly | Completed | Truncation/title support added where user/role names display. |
| Topbar page title | Completed | Route-derived page title shown. |
| Topbar school name | Completed | Available authenticated display name remains visible; school context placeholder says assigned school. |
| Topbar role badge | Completed | Role badge shown beside title on supported widths. |
| Topbar contextual search placeholder | Completed | Placeholder changed to school-record language. |
| Topbar notification placeholder | Completed | Placeholder has no fake count/badge. |
| Topbar/profile trigger as needed | Completed | Profile summary remains visible in topbar. |
| Mobile sidebar drawer behavior | Completed | Drawer closes from backdrop, close button, and nav link click. |
| Usable touch targets | Completed | Shell buttons and links use 44px-ish heights. |
| Keyboard accessible navigation | Completed | Links/buttons include focus-visible rings. |
| No sidebar route-not-found links | Completed | No new shell routes introduced; existing route map preserved. |

## Language Cleanup

| Requirement | Status | Notes |
| --- | --- | --- |
| Replace/hide tenant wording in school-facing views | Completed | School Admin dashboard copy no longer says tenant. |
| Replace/hide generic SaaS/workspace wording | Completed | New shell/dashboards use school operations language. |
| Replace/hide generic Coming Soon cards | Completed | Changed School Admin module surfaces to status/setup previews. |
| Avoid customer/sales/project labels | Completed | Changed surfaces avoid those labels. |
| Use school/campus/academic/class/section/subject language | Completed | Dashboard and module hub use school-specific language. |

## School Admin Dashboard

| Requirement | Status | Notes |
| --- | --- | --- |
| Premium hero with school name | Completed | Uses normalized dashboard school data. |
| Role: School Admin / Principal | Completed | Header and module sidebar use School Admin / Principal. |
| Current date/context | Completed | Hero displays current date context. |
| School Operations Dashboard heading | Completed | Heading added. |
| Principal Daily Brief | Completed | Hero and real metric/dashboard sections form the brief. |
| Today's Action Queue | Completed | Uses setup actions derived from real metric zeros. |
| Metrics: Campuses, Teachers, Students, Parents | Completed | Real metrics/safe zero. |
| Metrics: Classes, Sections, Subjects | Completed | Real metrics/safe zero. |
| Metrics: Admissions, Attendance Records, Fee Records | Completed | Real metrics/safe zero. |
| Metrics: Exam Records, Library Books, LMS Progress | Completed | Real metrics/safe zero. |
| Analytics widgets with real arrays only | Completed | Existing normalized arrays render charts; empty states when empty. |
| Module Hub includes all requested modules | Completed | Includes Admissions, Students, Parents, Teachers, Academic, Classes, Sections, Subjects, Attendance, Timetable, Exams, Fees, Library, Reading, LMS, Notices, Reports, Settings. |
| School Setup Coach | Completed | Setup dependencies added from available real metrics/activity. |

## Role Dashboard Foundations

| Requirement | Status | Notes |
| --- | --- | --- |
| Teacher Daily Workspace | Completed | Foundation dashboard added. |
| Teacher profile summary | Completed | Shows endpoint source/refresh or empty when no data. |
| Teacher readiness board | Completed | Setup/preview board added with no fake assignments. |
| Teacher timetable/classes/subjects empty states | Completed | Precise empty/setup states added. |
| Student Growth Dashboard | Completed | Foundation dashboard added. |
| Student profile and daily focus | Completed | Uses profile when endpoint provides it; otherwise safe empty. |
| Student timetable/attendance/results/library/LMS empty states | Completed | Precise empty/setup states added. |
| Parent Engagement Hub | Completed | Foundation dashboard added. |
| Parent linked children selector | Completed | Uses `childProfiles` when provided; otherwise required no-child message. |
| Parent attention/leave/homework/results/fees/library previews | Completed | Preview/setup cards added; no backend workflow created. |
| Librarian dashboard foundation | Completed | Foundation dashboard and catalog/reading preview cards added. |
| Finance dashboard foundation | Completed | Foundation dashboard and finance setup/preview cards added. |

## Data And Safety

| Requirement | Status | Notes |
| --- | --- | --- |
| All dashboard numbers real backend data or safe zero | Completed | Existing dashboard endpoint values are normalized; missing values render zero. |
| No fake trends/badges/risk alerts/names | Completed | New dashboards do not add fake trend/risk/person data. |
| No static demo records | Completed | Sample seeded create forms removed from Teacher/Student/Parent/Library/Finance portal surfaces. |
| No undefined `.toLocaleString()` crashes | Completed | New number helpers guard nullable values. |
| Normalize dashboard data before rendering | Completed | School Admin uses existing normalizer; shared role foundation normalizes values/arrays. |
| Missing metrics default safely | Completed | Missing numeric values render zero. |
| Role permissions do not leak data | Completed | Existing protected layout and proxy routes preserved; no new cross-role routes added. |
| Preserve backend `/v1` routing | Completed | No backend route changes. |
| Preserve frontend `/api` proxy routing | Completed | All frontend dashboard calls use `/api/*/dashboard`. |

## Accessibility And Responsive

| Requirement | Status | Notes |
| --- | --- | --- |
| High contrast/readable text | Completed | Dark sidebar and status badges use readable text. |
| Clear focus states | Completed | Shell controls and key buttons include focus-visible rings. |
| Semantic headings | Completed | Dashboard sections use headings. |
| Accessible chart labels | Completed | Chart bars include visible labels, counts, and aria labels. |
| No color-only status indicators | Completed | Status badges include text. |
| Responsive desktop/tablet/mobile layout | Completed | Grids collapse; drawer navigation retained. |
| No content hidden behind sidebar/profile/logout | Completed | Sidebar nav scroll and footer separation added. |

## Validation

| Requirement | Status | Notes |
| --- | --- | --- |
| `npm run test --workspace @school-erp/web` | Completed | Passed with low-memory env. |
| `npm run typecheck --workspace @school-erp/web` | Completed | Passed after one nullable formatter fix. |
| `npm run build --workspace @school-erp/shared` | Completed | Passed with low-memory env. |
| API typecheck if backend changed | Completed | Not required; backend unchanged. |
| `npx prisma validate` if schema/backend changed | Completed | Not required; schema/backend unchanged. |
