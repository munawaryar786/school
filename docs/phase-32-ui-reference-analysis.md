# Phase 32 UI Reference Analysis

Date: 2026-06-20
Branch: `phase-32-single-school-premium`
Scope: UI/UX reference library and analysis only. No application code, backend routes, frontend routes, schema, or runtime behavior changed.

## Reference Library

The following screenshots were saved in `docs/ui-references/` for internal design inspiration only. They must not be copied exactly, and their sample text, names, numbers, layouts, and visual branding must not be reused as product data.

| File | Primary Use |
| --- | --- |
| `school-admin-dashboard-reference-01.jpg` | Bright analytics dashboard with sidebar, topbar, KPI strips, and chart grid. |
| `school-admin-dashboard-reference-02.jpg` | School dashboard with attendance, fees, calendar, student profile side panel, and compact analytics. |
| `school-admin-dashboard-reference-03.jpg` | School admin dashboard with revenue, students, calendar, notice board, and social-style counters. |
| `school-admin-dashboard-reference-04.jpg` | School admin dashboard with fee collection, notice board, activity feed, and event calendar. |
| `student-portal-reference-01.jpg` | Student exam portal with hero panel, quick actions, performance analytics, profile, tests, and announcements. |
| `student-portal-reference-02.jpg` | Student dashboard with profile details, notice board, exam results, and metric cards. |
| `parent-portal-reference-01.jpg` | Parent/student child overview with fee, exam, attendance, profile card, and reminders. |
| `parent-portal-reference-02.jpg` | Duplicate visual variant retained for parent/student portal analysis. |
| `admission-dashboard-reference-01.jpg` | Admissions dashboard with application counts, review queue, applicant table, interviews, tasks, and activity. |
| `mobile-student-dashboard-reference-01.jpg` | Mobile module tile grid for student/parent portal. |
| `mobile-student-dashboard-reference-02.jpg` | Mobile profile-first student dashboard with large tile cards. |
| `module-tile-dashboard-reference-01.jpg` | Large colored module tile dashboard pattern. |
| `module-tile-dashboard-reference-02.jpg` | School management module hub with tile grid plus summary cards. |
| `finance-dashboard-reference-01.jpg` | Fee management dashboard with finance tiles and fee table. |
| `operations-dashboard-reference-01.jpg` | Dense operations dashboard with tickets, orders, comments, contacts, and scrollable panels. |
| `school-admin-table-reference-01.jpg` | School admin data table/list page with filters, sidebar, and row actions. |
| `dark-analytics-dashboard-reference-01.jpg` | Dark-sidebar analytics dashboard with metric cards, charts, data tables, and activity feed. |

## 1. Product Direction

This product should feel like an individual school operating system, not a generic SaaS admin console. The main experience is for one school at a time: School Admin, Teacher, Student, Parent, Librarian, and Finance. Super Admin remains an internal platform/admin function and should not define the main visual identity.

The product language should be school-specific: admissions, attendance, classes, sections, fee collection, exam marks, library circulation, timetable, notices, parent engagement, and student progress. Avoid generic labels like widgets, customers, sales, projects, or tickets unless the module genuinely uses that domain term.

The premium direction should combine operational density with calm readability. School Admin needs a control room. Teacher needs a daily teaching workspace. Student and Parent need clear next actions. Librarian and Finance need focused work queues and trustworthy status summaries.

## 2. Layout Patterns

Sidebar patterns:
- Use a left sidebar for desktop with school brand/name at the top, primary role navigation below, and a sticky profile/logout area at the bottom.
- Sidebar should support its own vertical scroll so long module lists never hide profile/logout controls or overlap text.
- Active state should be obvious through background, left rail, icon color, and text weight.
- Group related modules: Core, Academics, Operations, Finance, Communication, Reports, Settings.

Topbar patterns:
- Topbar should show page title/context, scoped search, notification icon, and user/profile trigger.
- Search should be contextual, for example search students inside Students, search books inside Library.
- Notification/profile controls should not be decorative; if backed by real data, show counts, otherwise use safe inactive states.

Dashboard grid patterns:
- Use a first row of high-priority school KPIs, then split into charts, task panels, tables, and recent activity.
- Prefer 12-column desktop grids and 1-column mobile grids, with 2-column tablet support.
- Combine metric cards, chart cards, work queues, and upcoming schedule panels instead of only tiles.

Module tile layouts:
- Tiles work well for mobile and module hubs, but desktop School Admin should not be only tile-based.
- Module tiles should show icon, module name, short real status, and clear action state.
- Avoid generic Coming Soon cards in production. If a module is unavailable, show a precise disabled state such as `Requires academic year setup` or `No active term yet`.

Chart/card layouts:
- Cards should be simple, white/surface-based, with 8px radius or less, clear headings, real timestamps, and empty states.
- Charts should use real data, visible legends, accessible colors, and concise labels.
- Avoid stuffing chart cards with fake trends. A chart with no data should render an empty state with a next action.

Mobile dashboard patterns:
- Mobile should be role-first and task-first: profile/child card, urgent metrics, then module tiles.
- Use a drawer/sidebar from hamburger; never overlay it in a way that covers sidebar labels.
- Touch targets should be at least 44px high with readable labels.

Profile/logout placement:
- Desktop: bottom sticky profile card in sidebar plus dropdown for profile/settings/logout.
- Mobile: profile inside drawer header/footer, logout inside profile dropdown or drawer footer.
- Logout should not be a random top-level nav item in the middle of modules.

## 3. Role-Specific Portal Ideas

School Admin dashboard:
- School health KPIs: active students, teachers, parents, campuses, classes, sections, today attendance, pending fees, open admissions, upcoming exams.
- Operational widgets: admissions queue, fee collection snapshot, attendance exceptions, notice board, upcoming interviews/exams/events, recent activity.
- Charts: attendance trend, student distribution by class/section, fee status, admission funnel, exam performance, library circulation.

Teacher dashboard:
- Today schedule, assigned classes/sections/subjects, attendance marking queue, homework/assignments to review, upcoming exams, notices for teachers.
- Teacher should not see broad school finance or unrelated student data.

Student dashboard:
- Profile and class/section context, today timetable, attendance summary, homework/assignments, exam results, fee visibility if allowed, notices, library due books, LMS progress.
- Strong mobile-first tile layout is appropriate.

Parent dashboard:
- Child selector when multiple children exist, each child profile summary, attendance, fees due/paid, exam results, homework, notices, upcoming events, teacher communication.
- Parent must only see linked child/children.

Librarian dashboard:
- Book inventory, available copies, issued books, overdue returns, recent issues/returns, damaged/lost books, search and circulation queue.
- Primary workflow is issue/return/search, not broad school administration.

Finance dashboard:
- Fee collection, outstanding dues, partial payments, overdue invoices, daily receipts, concessions/discounts, class-wise dues, recent payments.
- Finance should use clear money formatting and audit-friendly tables.

## 4. Module Hub Design

Admissions:
- Queue cards for submitted, review, interview, accepted, rejected.
- Applicant table with filters, review stage, interview schedule, documents, tasks, and activity.

Students:
- Student directory, enrollment status, class/section, guardian links, attendance snapshot, fee status, documents.

Parents:
- Guardian directory, linked children, contact status, portal activation, communication preferences.

Teachers:
- Teacher directory, subjects, classes/sections assigned, workload, attendance responsibilities.

Academic:
- Academic year, terms, curriculum structure, class/section/subject setup, teacher assignments.

Classes:
- Class overview, sections count, students count, class teacher, active subjects.

Sections:
- Section roster, capacity, class, timetable, assigned teachers.

Subjects/Courses:
- Subject catalog, code/type, class applicability, teacher assignments.

Attendance:
- Mark attendance, exceptions, daily summary, trend, absent/late lists, teacher marking status.

Timetable:
- Week grid by class/section/teacher, conflict detection, room/resource view if supported.

Examination:
- Exam plans, schedules, marks entry, result summary, publish status, student/parent views.

Fees:
- Fee categories, structures, invoices, payments, dues, concessions, receipts, reports.

Library:
- Books, copies, issue/return, overdue, fines, inventory status.

LMS:
- Courses, materials, quizzes, progress, submissions, teacher/student views.

Notices:
- Announcements by audience, class/section targeting, publish/archive status, provider status for SMS/email.

Reports:
- Real data reports only: school summary, attendance, fees, exams, library, students, teachers.

Settings:
- School profile, campuses, academic defaults, roles/permissions, notification providers, branding.

## 5. Modern UI Rules

- Use premium school-specific language, not generic SaaS/ecommerce labels.
- Every label must be readable, accurate, and tied to implemented functionality.
- Use one consistent icon family, preferably lucide in the existing app.
- Colors must carry meaning: success, warning, danger, info, neutral. Avoid random module colors that conflict with statuses.
- Active states must be clear in sidebar, tabs, filters, segmented controls, and table row selections.
- No broken routes. If a module is not implemented, keep navigation in-page or show a precise disabled dependency state.
- No fake numbers. Missing data renders zero only where it is a safe count, otherwise an empty state.
- No static/demo-only charts. Charts must declare their real backend source before implementation.
- Avoid generic Coming Soon cards as the long-term pattern. Use setup guidance, dependency requirements, or precise unavailable states.

## 6. Dashboard Analytics Ideas And Data Sources

School Admin:
- Attendance trend: `AttendanceRecord` by date/status, scoped to `schoolId`.
- Student distribution: `StudentProfile` by class/section, scoped to `schoolId`.
- Admission funnel: `AdmissionApplication.status`, scoped to `schoolId`.
- Fee collection: `FeeRecord` or finance invoice/payment models by status and amount, scoped to `schoolId`.
- Exam performance: `ExamRecord` and result models by class/subject/status, scoped to `schoolId`.
- Library circulation: `LibraryBook`, `LibraryIssue`, `LibraryReturn`, scoped to `schoolId`.
- Recent activity: `AuditLog` scoped to `schoolId`.

Teacher:
- Assigned classes/subjects: teacher assignment/classroom models scoped by teacher and school.
- Attendance queue: attendance records or timetable slots for assigned class/section.
- Assignment review: LMS/assignment submissions scoped to assigned courses.

Student:
- Attendance summary: student attendance records.
- Timetable: class/section timetable.
- Results: result records for current student.
- LMS progress: `LmsProgress` scoped to student.

Parent:
- Child summaries: linked student records only.
- Fees, attendance, results, notices: all filtered through linked child/children.

Librarian:
- Inventory status: `LibraryBook.status`, copies/available copies where supported.
- Circulation: issue/return/overdue models.

Finance:
- Dues and collection: fee records, invoices, payments, discounts, scholarships.
- Empty states should explain what setup is missing: no fee structure, no invoices, no payments, no academic year.

## 7. Sidebar And Logout Rules

- Sidebar owns its scroll area; page content scroll should not hide sidebar footer controls.
- Profile card is sticky at the bottom on desktop.
- Logout lives in a clean dropdown or sidebar footer, not as a random module item.
- Do not allow popovers or overlays to cover sidebar labels.
- Mobile sidebar uses a drawer with backdrop, close button, focus trap, and clear profile/logout footer.
- Long school names should truncate gracefully with tooltip/title where appropriate.

## 8. Design System Recommendations

Color palette direction:
- Use a school-trust palette: deep navy/ink, emerald/teal for primary school operations, blue for information, amber for attention, red for risk, neutral surfaces.
- Avoid one-note dashboards dominated by a single hue. Module colors can vary, but status colors must remain consistent.

Card styles:
- 8px radius, subtle border, modest shadow, clean heading, clear content hierarchy.
- Metric cards should include label, value, supporting context, and optional trend only if real.

Status badges:
- Use consistent badge tones: Active/Present/Paid success, Pending/Invited warning, Suspended/Overdue/Rejected danger, Draft/Archived neutral.
- Badge text must map to backend status values and be humanized consistently.

Module tiles:
- Use icon, module name, short status/dependency line, and optional real count.
- Tiles should have stable dimensions and responsive wrapping.

Chart styles:
- Use accessible palettes, visible legends, labels, and empty states.
- Prefer simple bar/line/donut charts for dashboards; reserve complex charts for report pages.

Typography:
- Page titles should be strong but not marketing-sized.
- Dashboard cards need compact headings and readable numeric values.
- Avoid negative letter spacing and viewport-scaled font sizes.

Spacing:
- Use consistent 16px/20px/24px rhythm.
- Dense operational tables are acceptable, but row height and click targets must remain usable.

Responsive behavior:
- Desktop: sidebar + topbar + grid.
- Tablet: collapsible sidebar, 2-column cards.
- Mobile: drawer navigation, profile summary, urgent cards, module grid, one-column charts.

## 9. Implementation Plan For Next Steps

Phase 32B: Premium school shell and role dashboards
- Build the premium school shell, sidebar, topbar, profile/logout dropdown, responsive drawer, and role dashboard foundations.
- Keep backend `/v1` and frontend `/api` routing intact.
- Use only real dashboard data and precise empty states.

Phase 32C: Admissions workflow
- Implement admission application list, review queue, interview schedule, status transitions, tasks, and applicant detail.

Phase 32D: Academic setup
- Implement academic years, terms, classes, sections, subjects/courses, and teacher assignments.

Phase 32E: Teacher/student/parent workflows
- Implement role dashboards, scoped data access, teacher assignments, student profile/attendance/results, and parent linked-child views.

Phase 32F: Library/exams/fees/LMS modules
- Implement library circulation, exam schedules/results, fee structures/payments, LMS materials/progress, and module-specific reports.

## Non-Negotiables

- Do not copy reference images exactly.
- Do not copy fake names, fake labels, fake numbers, or copyrighted layouts.
- Do not create decorative dashboards without real data.
- Do not introduce broken routes.
- Do not make Super Admin the main product experience.
- Keep the product centered on a premium individual school ERP operating system.
