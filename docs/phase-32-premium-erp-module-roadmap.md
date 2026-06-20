# Phase 32 Premium ERP Module Roadmap

Date: 2026-06-20
Scope: Documentation/specification only. No implementation changes.

## Roadmap Principles

- Build a premium individual school operating system, not a generic SaaS dashboard.
- Keep backend routes under `/v1` and frontend proxy under `/api` during implementation phases.
- Every dashboard/widget uses real backend/database data.
- No fake charts, fake scores, fake names, or fake sample records.
- Each phase must include loading, empty, error, retry, permissions, and targeted validation.

## Phase 32B: Premium School Shell + Role Dashboards + Module Preview Pages

Scope:
- Premium school shell, sidebar with own scroll, sticky profile card, logout dropdown, mobile drawer.
- Role dashboards for School Admin/Principal, Teacher, Student, Parent, Librarian, Finance.
- Module preview pages with precise setup-required states, not generic Coming Soon cards.

Pages:
- `/school-admin`, `/teacher`, `/student`, `/parent`, `/library`, `/finance` dashboard foundations.
- Module hub/preview views inside School Admin shell.

Backend models:
- Existing models only where possible: School, Campus, profiles, attendance, fees, exams, library, LMS, notices, AuditLog.

Backend routes:
- Existing dashboard routes plus future `/v1/<role>/dashboard` routes only if required.

UI components:
- SchoolShell, RoleSidebar, Topbar, ProfileMenu, ModuleTile, MetricCard, ChartCard, EmptyState, ErrorState, SetupRequiredState.

Validation plan:
- Web typecheck/test.
- API typecheck if routes changed.
- Manual route access checks for roles.

Preview acceptance:
- School Admin sees premium school-specific dashboard.
- Teacher/student/parent/librarian/finance dashboards do not crash and show scoped real data/empty states.
- No broken module links.

Risks:
- Existing app shell may conflict with new shell.
- Role data may be sparse.

Do not implement:
- Admissions workflow, academic CRUD, attendance marking, library circulation, fees, LMS workflows.

## Phase 32C: Parent Portal Engagement Foundation

Scope:
- Child overview, attendance view, leave request, notices, teacher messages preview, library/reading requests preview.

Pages:
- Parent dashboard, child detail, attendance, leave requests, notices, messages, library/reading request entry.

Backend models:
- GuardianStudentLink, LeaveRequest, LeaveRequestTimeline, NoticeReadReceipt, MessageThread, BookRequest draft models if needed.

Backend routes:
- `/v1/parents/children`
- `/v1/parents/children/:studentId/summary`
- `/v1/parents/children/:studentId/leave-requests`
- `/v1/parents/notices`
- `/v1/parents/messages`

UI components:
- ChildSelector, ChildSummaryCard, LeaveRequestForm, Timeline, NoticeList, MessagePreview, ReadingRequestCard.

Validation:
- Parent cannot see unrelated child.
- Leave request creates timeline.
- Teacher/admin review route protected if added.

Preview acceptance:
- Parent logs in, selects child, sees real child data/empty states.
- Parent submits leave request.
- Reviewer sees request.

Risks:
- Existing parent/student relations may need schema stabilization.

Do not implement:
- Full library circulation or reading badges.

## Phase 32D: Library and Reading Workflow

Scope:
- Books, copies, issue/return, request queue, recommended reading foundation.

Pages:
- Library dashboard, catalog, book detail, issue/return, overdue, requests, reading lists.
- Student/parent library view.

Backend models:
- LibraryBook, BookCopy, LibraryIssue, LibraryReturn, LibraryFine, BookRequest, ReadingList, ReadingLog.

Backend routes:
- `/v1/library/books`
- `/v1/library/copies`
- `/v1/library/issues`
- `/v1/library/issues/:id/return`
- `/v1/library/requests`
- `/v1/library/reading-lists`

UI components:
- CatalogTable, BookForm, CopyManager, IssueReturnDialog, OverdueList, RequestQueue, ReadingListBuilder.

Validation:
- Copy availability changes after issue/return.
- Overdue status computed from due date.
- Parent/student only see own/linked library records.

Preview acceptance:
- Librarian adds book/copy, issues book, returns book.
- Parent/student sees issued/overdue books.

Risks:
- Book copy modeling may require migration.

Do not implement:
- Reading badges/challenges unless core circulation is stable.

## Phase 32E: Admissions Workflow

Scope:
- Inquiry/application pipeline, document checklist, interview schedule, review notes, status transitions, conversion to student/parent.

Pages:
- Admissions dashboard, inquiry, application, applicant detail, review queue, interview schedule, conversion.

Backend models:
- AdmissionInquiry, AdmissionApplication, AdmissionGuardian, AdmissionDocumentChecklist, AdmissionInterview, AdmissionReviewNote, AdmissionStatusHistory.

Backend routes:
- `/v1/admissions/inquiries`
- `/v1/admissions/applications`
- `/v1/admissions/applications/:id`
- `/v1/admissions/applications/:id/status`
- `/v1/admissions/applications/:id/convert`

UI components:
- AdmissionFunnel, ApplicantTable, ApplicantDetail, Checklist, InterviewScheduler, ConversionDialog.

Validation:
- Status transitions valid.
- Conversion creates/link student/parent safely.
- No duplicate applicant without warning.

Preview acceptance:
- Create inquiry, convert to application, approve, enroll.

Risks:
- Transaction complexity for conversion.

Do not implement:
- Applicant scoring/ROI until core pipeline works.

## Phase 32F: Academic Setup

Scope:
- Academic year, terms, classes, sections, subjects, teacher assignments, class teacher, setup wizard.

Pages:
- Academic setup wizard, years, terms, classes, sections, subjects, assignments.

Backend models:
- AcademicYear, Term, ClassLevel, Section, Subject, TeacherSubjectAssignment, ClassTeacherAssignment.

Backend routes:
- `/v1/academic/years`
- `/v1/academic/terms`
- `/v1/academic/classes`
- `/v1/academic/sections`
- `/v1/academic/subjects`
- `/v1/academic/teacher-assignments`

UI components:
- SetupWizard, AcademicYearForm, ClassSectionManager, SubjectManager, AssignmentMatrix.

Validation:
- School scoping.
- No cross-school class/teacher/subject assignment.

Preview acceptance:
- School Admin creates academic year, class, section, subject, assigns teacher.

Risks:
- Existing generic models may need richer relationships.

Do not implement:
- Timetable conflict detection.

## Phase 32G: Teacher / Student Workflows

Scope:
- Teacher dashboard, assigned classes/subjects, homework/assignments, student dashboard, student profile/progress.

Pages:
- Teacher dashboard, assigned classes, homework, marks queue preview.
- Student dashboard, profile, assignments, results preview.

Backend models:
- Teacher assignments, Homework, Assignment, Submission, StudentProfile, Result references.

Backend routes:
- `/v1/teachers/dashboard`
- `/v1/teachers/classes`
- `/v1/teachers/assignments`
- `/v1/students/me/dashboard`
- `/v1/students/me/assignments`

UI components:
- TeacherDailyAgenda, ClassRoster, HomeworkForm, ReviewQueue, StudentDashboardCards.

Validation:
- Teacher assigned-only access.
- Student own-only access.

Preview acceptance:
- Teacher sees assigned data only.
- Student sees own dashboard only.

Risks:
- Assignment data needs clean class/section/subject links.

Do not implement:
- LMS heatmaps or weak topic suggestions.

## Phase 32H: Attendance / Timetable

Scope:
- Teacher attendance marking, parent leave integration, class/section/teacher timetable.

Pages:
- Attendance marking, attendance reports, timetable builder, timetable views.

Backend models:
- AttendanceRecord, LeaveRequest, TimetableSlot, TeacherAssignment.

Backend routes:
- `/v1/attendance/mark`
- `/v1/attendance/reports`
- `/v1/timetable/slots`
- `/v1/timetable/class/:id`
- `/v1/timetable/teacher/me`

UI components:
- AttendanceGrid, LeaveIndicator, AttendanceSummary, TimetableGrid, TeacherAgenda.

Validation:
- Prevent duplicate attendance per student/date/class/section.
- Teacher can mark assigned class only.

Preview acceptance:
- Teacher marks attendance; parent sees child attendance; approved leave becomes excused context.

Risks:
- Leave/attendance date logic.

Do not implement:
- Advanced risk heatmaps yet.

## Phase 32I: Exams / Results

Scope:
- Exam setup, schedule, marks entry, result publish, student/parent result view.

Pages:
- Exams dashboard, schedule, marks entry, result publish, report card view.

Backend models:
- Exam, ExamSchedule, Mark, Result, ReportCard, PublishStatus.

Backend routes:
- `/v1/exams`
- `/v1/exams/schedules`
- `/v1/exams/marks`
- `/v1/exams/results/publish`
- `/v1/students/me/results`
- `/v1/parents/children/:studentId/results`

UI components:
- ExamScheduler, MarksGrid, PublishDialog, ResultCard, ReportCardView.

Validation:
- Draft results hidden from students/parents.
- Teacher assigned marks only.

Preview acceptance:
- Schedule exam, enter marks, publish result, student/parent sees result.

Risks:
- Grading rules and report format complexity.

Do not implement:
- Weak subject AI/suggestions yet.

## Phase 32J: Fees / Finance

Scope:
- Fee structures, invoices, payments, receipts, parent fee view, finance dashboard.

Pages:
- Finance dashboard, categories, structures, invoices, payments, receipts, student ledger.

Backend models:
- FeeCategory, FeeStructure, FeeInvoice, Payment, Receipt, StudentLedger, Discount/Concession later.

Backend routes:
- `/v1/fees/categories`
- `/v1/fees/structures`
- `/v1/fees/invoices`
- `/v1/fees/payments`
- `/v1/fees/reports`

UI components:
- FeeSetup, InvoiceTable, PaymentDialog, ReceiptView, LedgerView, FinanceMetrics.

Validation:
- Money totals reconcile.
- Parent linked child fees only.
- Finance assigned school only.

Preview acceptance:
- Create fee structure, invoice student, record payment, parent sees status.

Risks:
- Financial accuracy and audit trail.

Do not implement:
- Online payment provider unless configured.

## Phase 32K: LMS / Reports

Scope:
- LMS materials/assignments/progress foundation and real reports hub.

Pages:
- LMS courses, lessons, assignments, submissions, progress.
- Reports hub and module reports.

Backend models:
- LmsCourse, LmsLesson, LmsMaterial, Assignment, Submission, LmsProgress, report aggregate queries.

Backend routes:
- `/v1/lms/courses`
- `/v1/lms/lessons`
- `/v1/lms/assignments`
- `/v1/lms/submissions`
- `/v1/reports/*`

UI components:
- CourseList, LessonEditor, AssignmentBuilder, SubmissionReview, ProgressCard, ReportFilters, ExportButton.

Validation:
- Teacher assigned courses only.
- Student enrolled courses only.
- Reports real data only.

Preview acceptance:
- Teacher posts assignment/material, student sees it, progress updates, reports show real data.

Risks:
- LMS scope can expand quickly; keep foundation narrow.

Do not implement:
- AI learning suggestions until enough real data exists.
