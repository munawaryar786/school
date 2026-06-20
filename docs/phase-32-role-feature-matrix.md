# Phase 32 Role Feature Matrix

Date: 2026-06-20
Scope: Documentation/specification only. No implementation changes.

Legend: Manage = create/edit/approve where permitted. View = read-only scoped view. Own = only own data. Linked = linked child/children only. Assigned = assigned classes/sections/subjects/students only.

| Feature | Module | School Admin | Teacher | Student | Parent | Librarian | Finance | Backend data required | Dashboard widget | Permission rule | Priority | Premium differentiator | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| School dashboard metrics | Control Center | Manage/View | No | No | No | No | View finance subset | School, users, profiles, modules | School health cards | Assigned school only | P0 | No | Main demo surface. |
| Principal View Mode | Control Center | View | No | No | No | No | No | Aggregated school metrics | Principal summary | Principal/Owner role | P1 | Yes | Executive mode. |
| School Health Score | Analytics | View | Assigned class subset | Own/none | Linked summary | Library subset | Finance subset | Attendance, fees, exams, library, LMS | Health score | Strict role scope | P2 | Yes | Never calculate without enough data. |
| Today's Action Queue | Control Center | Manage | Assigned tasks | Own tasks | Linked child tasks | Library tasks | Finance tasks | Approvals, attendance, fees, messages | Action queue | Role-specific tasks | P0 | Yes | Core premium workflow. |
| Setup Progress | Academic | Manage | View relevant | No | No | No | No | Academic setup records | Setup progress | School Admin only | P0 | Yes | Replace generic Coming Soon. |
| Approval Inbox | Approvals | Manage | Review assigned | No | Submit requests | Review book requests | Review concessions | ApprovalRequest | Pending approvals | Assigned reviewer | P1 | Yes | Unified workflow. |
| Admission inquiry | Admissions | Manage | Assigned interview view | No | Submit if applicant portal | No | No | Inquiry | Admission funnel | School scoped | P0 | No | Start pipeline. |
| Admission application | Admissions | Manage | Assigned interview view | No | Submit/view own | No | No | Application, guardian | Applications count | School/applicant scoped | P0 | No | Professional pipeline. |
| Document checklist | Admissions/Documents | Manage | View if assigned | No | Upload own application docs | No | No | DocumentChecklist, DocumentRecord | Missing docs | School/applicant scoped | P0 | Yes | Strong admission UX. |
| Interview/test schedule | Admissions | Manage | Assigned interview | No | View own | No | No | InterviewSchedule | Upcoming interviews | Assigned only | P1 | No | Links to teacher tasks. |
| Convert applicant to student | Admissions | Manage | No | No | Parent account created/linked | No | No | EnrollmentConversion, StudentProfile | Enrolled count | School Admin only | P1 | No | Must be transactional. |
| Applicant Scorecard | Admissions | View/Manage | Input assigned test notes | No | No | No | No | Scores, notes, documents | Applicant score | School scoped | P2 | Yes | No fake scoring. |
| Academic year setup | Academic | Manage | View | View current | View current | View relevant | View finance term | AcademicYear | Setup progress | School Admin only | P0 | No | Dependency for modules. |
| Term/semester setup | Academic | Manage | View | View current | View current | View relevant | View finance term | Term | Setup progress | School Admin only | P0 | No | Needed for exams/fees. |
| Class/grade setup | Academic | Manage | Assigned view | Own view | Linked view | View for reading lists | View for fees | ClassLevel | Class count | School scoped | P0 | No | Core SIS. |
| Section setup | Academic | Manage | Assigned view | Own view | Linked view | View for reading lists | View for fees | Section | Section count | School scoped | P0 | No | Core SIS. |
| Subject/course setup | Academic | Manage | Assigned view | Own view | Linked view | No | No | Subject | Subject count | School scoped | P0 | No | Core academics. |
| Teacher subject assignment | Academic/Teachers | Manage | Assigned view | Own class subjects | Linked child subjects | No | No | TeacherSubjectAssignment | Unassigned subjects | School scoped | P0 | No | Required for teacher portal. |
| Class teacher assignment | Academic | Manage | Assigned class view | Own class teacher | Linked class teacher | No | No | ClassTeacherAssignment | Classes without teacher | School scoped | P1 | No | Supports messages/leave. |
| Capacity alerts | Academic | View | No | No | No | No | No | Capacity, enrollment | Capacity alert | School Admin only | P2 | Yes | Premium planning. |
| Teacher profile | Teachers | Manage | Own view | View assigned teacher names | View linked child teachers | No | No | TeacherProfile, User | Teacher count | School scoped | P0 | No | Core HR-ish record. |
| Teacher dashboard | Teachers | No | View/Act assigned | No | No | No | No | Assignments, timetable, attendance | Today's classes | Assigned teacher | P0 | No | Daily workspace. |
| Attendance marking | Attendance | View/override | Mark assigned | View own | View linked | No | No | AttendanceRecord | Not marked queue | Assigned teacher | P0 | No | Required demo/pilot. |
| Attendance pending queue | Attendance | View | Act assigned | No | No | No | No | Timetable, AttendanceRecord | Pending attendance | Assigned teacher | P0 | Yes | Critical teacher UX. |
| Homework creation | LMS/Homework | View | Manage assigned | View own | View linked | No | No | Homework/Assignment | Homework pending | Assigned teacher | P1 | No | Pilot feature. |
| Assignment review queue | LMS | View | Manage assigned | View own status | View linked | No | No | Submission, Feedback | Review queue | Assigned teacher | P1 | Yes | Teacher productivity. |
| Marks entry | Exams | View/publish | Enter assigned | View published | View linked published | No | No | Marks, ExamSchedule | Marks pending | Assigned teacher | P1 | No | Requires exam setup. |
| Weak Student Watchlist | Analytics | View school | View assigned | Own guidance | Linked child guidance | No | No | Attendance, results, LMS | Weak students | Scoped risk | P2 | Yes | No fake alerts. |
| Class Diary | Teachers | View | Manage assigned | View if published | View if published | No | No | ClassDiary | Recent diary | Assigned class | P1 | Yes | Strong school feel. |
| Student profile | Students | Manage | View assigned | Own view | Linked view | No | Finance fee subset | StudentProfile | Student count | Scoped | P0 | No | Core SIS. |
| Guardian link | Students/Parents | Manage | View assigned contact | No | Linked access | No | No | GuardianStudentLink | Parents linked | School scoped | P0 | No | Privacy critical. |
| Student dashboard | Students | No | No | Own view | No | No | No | Student scoped records | My dashboard | Own data only | P0 | No | Must be clean/mobile. |
| My Week Dashboard | Student | No | No | Own view | Linked summary | No | No | Timetable, assignments, exams | My week | Own/linked | P2 | Yes | Premium student UX. |
| Student Progress Timeline | Student | View | Assigned notes | Own view | Linked view | No | No | Results, LMS, reading, attendance | Progress timeline | Own/linked/assigned | P2 | Yes | Differentiator. |
| Parent dashboard | Parents | No | No | No | Linked view | No | No | Guardian links and child records | Children overview | Linked only | P0 | No | Engagement hub. |
| Parent child selector | Parents | No | No | No | Linked only | No | No | GuardianStudentLink | Child selector | Linked only | P0 | No | Required if multiple children. |
| Parent leave request | Attendance/Parent | Review/approve | Review assigned class | View own status | Submit linked child | No | No | LeaveRequest, AttendanceRecord | Leave status | Linked child/reviewer | P1 | Yes | Paid pilot priority. |
| PTM request | Communication | Manage/review | Respond assigned | No | Submit linked child | No | No | PTMRequest | PTM requests | Relationship scoped | P1 | Yes | Parent engagement. |
| Complaint/feedback | Communication | Manage | View if assigned | No | Submit/view own | No | No | Complaint | Open complaints | Scoped | P2 | Yes | Needs careful workflow. |
| Notice read tracking | Communication | View | Read/ack assigned | Read own | Read linked audience | Read relevant | Read relevant | NoticeReadReceipt | Unread/ack pending | Audience scoped | P2 | Yes | No fake reads. |
| Teacher-parent messages | Communication | View audit | Assigned threads | No | Linked child threads | No | No | MessageThread | Messages | Relationship scoped | P1 | Yes | Needs moderation/audit. |
| Book catalog | Library | View | View | Search/view | Search/view | Manage | No | LibraryBook, BookCopy | Total books | School library scoped | P1 | No | Core library. |
| Issue/return book | Library | View | No | View own issues | View linked issues | Manage | No | LibraryIssue, Return | Issued/overdue | Librarian only | P1 | No | Pilot feature. |
| Overdue books | Library | View | Assigned student context | Own view | Linked view | Manage | No | LibraryIssue | Overdue books | Scoped | P1 | No | Parent/student alert. |
| Book reservation request | Library/Parent | View | No | Submit own | Submit linked child | Manage queue | No | BookRequest | Requests pending | Own/linked/library | P2 | Yes | Reading differentiator. |
| Request librarian add book | Reading/Library | View | Recommend | Submit own | Submit linked child | Review | No | BookRequest | Add requests | Own/linked/library | P2 | Yes | Strong parent hook. |
| Reading log upload | Reading | View | Review assigned | Submit own | Upload/confirm linked | Review | No | ReadingLog | Reading progress | Own/linked/assigned | P2 | Yes | Parent engagement. |
| Reading badges | Reading | View | Award/recommend | Own view | Linked view | Manage rules | No | ReadingBadge | Badges | Scoped | P2 | Yes | Do not fake. |
| Fee structure | Fees | View/approve | No | View own due | View linked due | No | Manage | FeeStructure | Fee setup | Finance/Admin | P1 | No | Pilot feature. |
| Student invoice/payment | Fees | View | No | View own | View linked/pay | No | Manage | Invoice, Payment | Fee due/paid | Finance/Admin/linked | P1 | No | Money accuracy. |
| Fee Risk Dashboard | Finance/Analytics | View | No | No | Linked reminders | No | Manage | Payments, due dates | Fee risk | Finance/Admin | P2 | Yes | No fake risk. |
| Timetable builder | Timetable | Manage | View assigned | View own | View linked | No | No | TimetableSlot | Timetable status | School/Admin scoped | P1 | No | P0 widgets if existing. |
| Student/parent timetable | Timetable | View | View assigned | Own view | Linked view | No | No | TimetableSlot | Today timetable | Own/linked | P0 | No | Useful launch widget. |
| Exam schedule | Exams | Manage | View assigned | View own | View linked | No | No | ExamSchedule | Upcoming exams | Scoped | P0 | No | Launch widget. |
| Result publish | Exams | Approve/publish | Enter/request publish | View published own | View linked published | No | No | Result, PublishStatus | Latest results | Scoped | P1 | No | Avoid draft leak. |
| Result acknowledgement | Exams | View | View assigned | No | Acknowledge linked | No | No | ParentAcknowledgement | Ack pending | Linked | P2 | Yes | Premium governance. |
| LMS materials | LMS | View | Manage assigned | View enrolled | View linked | No | No | Course, Material | LMS progress | Assigned/enrolled | P1 | No | Learning ops. |
| LMS progress heatmap | LMS/Analytics | View | Assigned view | Own view | Linked view | No | No | LmsProgress | Heatmap | Scoped | P2 | Yes | No fake heatmaps. |
| Health profile | Health | Manage sensitive | View if authorized | Own view | Manage linked | No | No | HealthProfile | Medical flags | Strict scoped/audited | P1 | Yes | Sensitive. |
| Emergency quick card | Health | View | View if authorized | No | Manage linked contacts | No | No | EmergencyContact | Missing contacts | Strict/audited | P2 | Yes | Safety differentiator. |
| Behavior notes | Discipline | Review/manage | Create assigned | View approved own | View approved linked | No | No | BehaviorNote | Open notes | Visibility controlled | P1 | Yes | Avoid overexposure. |
| Reports hub | Reports | View/export | Assigned reports | Own reports | Linked reports | Library reports | Finance reports | Aggregates | Reports available | Role-scoped | P1 | No | Real data only. |
| Class Health Report | Analytics | View | Assigned class | No | No | No | No | Attendance, results, LMS | Class health | Scoped | P2 | Yes | Premium analytics. |
| Reading Culture Report | Analytics/Library | View | Class view | Own view | Linked view | Manage | No | Reading logs, issues | Reading culture | Scoped | P2 | Yes | Differentiator. |
