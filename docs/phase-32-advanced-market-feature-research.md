# Phase 32 Advanced Market Feature Research

Date: 2026-06-20
Branch: `phase-32-single-school-premium`
Scope: Documentation/specification only. No app code, route, schema, install, build, merge, or push.

## Research Basis

Web research was available. This specification combines existing project context, `docs/phase-32-ui-reference-analysis.md`, `docs/ui-references/`, and official/public education platform patterns.

Sources reviewed:
- Google Classroom: teachers create/manage classes, assignments, grades, materials, feedback, announcements; students track/submit work; guardians receive summaries; admins manage rosters and permissions: https://support.google.com/edu/classroom/answer/6020279
- Google Classroom guardian summaries: missing work, upcoming work, class activity, guardian invitation/settings flow: https://support.google.com/edu/classroom/answer/6388136
- Instructure K-12/Canvas ecosystem: LMS, assessment, family engagement, records/process workflows, insights: https://www.instructure.com/k12
- Follett Library Suite: cataloging, circulation, inventory, reading recommendations, challenges, awards, resource management: https://follettsoftware.com/library-suite/
- SIS/library category patterns: student demographics, attendance, schedules, grades, transcripts, communication, reporting, cataloging/circulation/patron workflows.

Do not copy vendor layouts, text, fake numbers, or sample names. Use this only as market context for our premium individual school ERP.

## Product Vision

The ERP must become a premium individual school operating system: ERP + student growth platform + parent engagement hub + teacher daily workspace + library and reading culture system + finance operations + LMS foundation + analytics/risk alerts. Super Admin remains internal; the main product experience is one school's real users.

## Module Research Matrix

Each module below includes: Common Market Features; Premium Differentiators; P0 Launch Demo; P1 Paid Pilot; P2 Future; Required Backend Data; Required Frontend Pages; Dashboard Widgets; Empty States; Permission Rules; What Not To Fake.

### A. School Admin / Principal Control Center

- Common: school dashboard, student/teacher/parent counts, classes/sections, admissions, attendance, fees, exams, notices, reports, calendar, user management.
- Premium: School Health Score, Today's Action Queue, Principal View Mode, Risk Alerts, Setup Progress, Campus Comparison, Approval Inbox, Parent Engagement Score, Class Health Report, Reading Culture Score, Teacher Activity Snapshot.
- P0: real school KPIs, admission funnel, attendance exceptions, fee status, upcoming exams, recent activity, precise module states.
- P1: approval inbox, setup wizard, fee/attendance risk queues, principal view.
- P2: health score algorithm, campus comparison, engagement/reading/class health scores.
- Data: School, Campus, AcademicYear, Term, ClassLevel, Section, Subject, TeacherProfile, StudentProfile, parent links, admissions, attendance, fees, exams, library, LMS, notices, AuditLog.
- Pages: dashboard, principal control center, setup progress, module hub, approval inbox, risk alerts.
- Widgets: active students/teachers, parents linked, admission funnel, attendance exceptions, overdue fees, exams, overdue books, LMS progress, approvals, unread messages, activity.
- Empty: no academic year, no classes, no attendance marked today, no fee structure, no exam schedule.
- Permissions: School Admin/Principal see assigned school only; staff sees assigned areas; Super Admin is platform/internal.
- Do not fake: health scores, risk alerts, approvals, engagement, LMS progress, recent activity.

### B. Admissions

- Common: inquiry, application, applicant details, guardian details, previous school, documents, interview/test schedule, notes, approve/reject/enroll.
- Premium: Applicant Scorecard, Parent Readiness Checklist, Follow-up Queue, Admission Source ROI, Interview/Test Pipeline, Missing Document Alerts, duplicate detection.
- P0: admission dashboard, funnel, applicant list, application detail, statuses Inquiry/Applied/Under Review/Interview-Test Scheduled/Approved/Rejected/Enrolled/Cancelled.
- P1: convert approved applicant to student, create/link parent, assign class/section, reminders, schedule.
- P2: scorecard, source ROI, duplicate confidence, conversion analytics.
- Data: Inquiry, Application, Guardian, PreviousSchool, DocumentChecklist, InterviewSchedule, ReviewNote, StatusHistory, Source, FollowUp, EnrollmentConversion.
- Pages: dashboard, inquiry form, application form, applicant detail, review queue, interview schedule, checklist, conversion screen.
- Widgets: inquiries, applied, under review, scheduled, approved, rejected, enrolled, missing docs, follow-ups due.
- Empty: no applications, no checklist configured, no interview slots.
- Permissions: School Admin/admissions staff manage assigned school; teachers see assigned interviews/tests only.
- Do not fake: statuses, documents, score, ROI, conversion rate.

### C. Academic Setup

- Common: academic year, term, class/grade, section, subject/course, teacher assignment, class teacher, capacity, optional/compulsory subjects, calendar.
- Premium: Academic Setup Wizard, Class Capacity Alerts, Curriculum Completion Analytics, Class Health Snapshot, Teacher Workload Balance, timetable dependency checks.
- P0: setup overview, create/list years/classes/sections/subjects, teacher assignment where supported.
- P1: promotion workflow, class teacher assignment, syllabus map, academic calendar.
- P2: completion analytics, workload balancing, capacity forecast.
- Data: AcademicYear, Term, ClassLevel, Section, Subject, TeacherAssignment, ClassTeacher, Capacity, SyllabusUnit, CurriculumProgress, PromotionRecord.
- Pages: setup wizard, years, terms, classes, sections, subjects, assignments, syllabus, promotion.
- Widgets: setup progress, classes without sections, subjects without teachers, over-capacity classes, curriculum completion.
- Empty: no academic year, no class, no teacher assignment.
- Permissions: School Admin manages; teachers view assigned structures only.
- Do not fake: completion, capacity, workload, curriculum progress.

### D. Teacher Management / Teacher Workspace

- Common: teacher profile, assigned classes/subjects, timetable, attendance marking, homework/assignments, lesson/material upload, marks entry, notices.
- Premium: Class Focus List, Weak Student Watchlist, Attendance Pending Queue, Homework Review Queue, Syllabus Progress Tracker, Parent Message Center, Workload Analytics, Class Diary, behavior notes, leave indicator before attendance, improvement notes.
- P0: teacher dashboard, today's classes, assigned classes/subjects, attendance pending queue.
- P1: attendance marking, homework review, marks entry, parent messages, class diary.
- P2: weak student watchlist, workload analytics, syllabus tracker, improvement notes.
- Data: TeacherProfile, User, SchoolMembership, class/section/subject assignments, TimetableSlot, AttendanceRecord, Homework, Assignment, Marks, LMSMaterial, Message, BehaviorNote.
- Pages: dashboard, timetable, attendance marking, homework/assignments, marks, materials, messages, diary, weak students.
- Widgets: today's classes, attendance not marked, reviews due, marks pending, exams, parent messages, weak students, syllabus completion.
- Empty: no assigned classes, no timetable today, all attendance marked.
- Permissions: teacher sees assigned school/classes/sections/subjects/students only.
- Do not fake: rosters, pending attendance, weak alerts, messages, marks, workload.

### E. Student Management / Student Portal

- Common: profile, admission number, class/section, guardians, timetable, attendance, homework, assignments, lessons, exam schedule/results, notices, library books.
- Premium: My Week Dashboard, Progress Timeline, Learning Gap Suggestions, Reading Goals/Log, Achievement Badges, Portfolio, Deadlines, Due Book Alerts, Assignment Completion Score, LMS Heatmap.
- P0: student dashboard with profile, class/section, attendance percentage, exams, latest results, assignments due, notices.
- P1: homework/assignment visibility, library issued books, result detail, timetable.
- P2: gap suggestions, badges, portfolio, LMS heatmap.
- Data: StudentProfile, User, guardians, class/section, timetable, attendance, homework, assignments, exams/results, notices, library issues, LMS progress, achievements.
- Pages: dashboard, profile, timetable, attendance, homework, results, library, reading log, notices, LMS.
- Widgets: timetable, attendance, assignments, exams, results, books, reading, LMS, notices, achievements.
- Empty: no timetable, no assignments, no published results.
- Permissions: student sees own data only.
- Do not fake: attendance, marks, assignments, LMS, achievements, recommendations.

### F. Parent / Guardian Portal

- Common: linked children selector, child profile, attendance, homework, assignments, results, fee status/payment history, notices, teacher messages, calendar.
- Premium: Parent Leave Request, PTM Request, Reading/Library Request, Request Librarian To Add Book, Book Reservation, Reading Log Upload/Confirmation, Reading Badges, Overdue Alerts, Behavior Notes, Health/Emergency Profile, Complaint/Feedback, Engagement Timeline, Notice Read Tracking.
- P0: parent dashboard with child selector, attendance, homework, latest results, notices, fees due, messages preview.
- P1: leave request, PTM request, fee/payment history, teacher messages, emergency profile basics.
- P2: reading request workflow, badges, engagement score, complaint analytics.
- Data: Parent user, GuardianStudentLink, AttendanceRecord, Assignment, Result, FeeRecord/Payment, Notice, MessageThread, LeaveRequest, PTMRequest, Complaint, LibraryRequest, ReadingLog, HealthProfile.
- Pages: dashboard, child detail, attendance, homework, results, fees, notices, messages, leave request, PTM, library/reading, health, feedback.
- Widgets: children overview, attendance, leave status, fees due, results, homework, overdue books, reading progress, unread notices, messages.
- Empty: no linked children, no fees, no messages, no reading list.
- Permissions: parent sees linked child/children only.
- Do not fake: child links, fees, results, messages, leave approvals, badges, read tracking.

### G. Attendance

- Common: class/section attendance, teacher marking, present/absent/late/excused, daily summary, reports, parent/student view.
- Premium: Parent Leave Integration, Consecutive Absence Alert, Low Attendance Risk, Class Heatmap, Teacher Pending Marking Queue, Excused Leave Auto Context, Parent Notification Queue.
- P0: School Admin summary, Teacher pending queue, Student/Parent percentage.
- P1: teacher marking by assigned class/section, leave integration, daily reports.
- P2: consecutive absence, risk alerts, heatmaps.
- Data: AttendanceRecord with schoolId, classId, sectionId, studentId, date, status, markedBy, leaveRequestId, remarks.
- Pages: attendance dashboard, marking screen, daily report, student/parent attendance, exceptions.
- Widgets: today's attendance, not marked classes, absent/late/excused, low risk.
- Empty: no attendance marked today should show pending marking, not zero-performance chart.
- Permissions: teachers mark assigned classes only; School Admin sees school; student/parent sees own/linked child.
- Do not fake: percentages, risk, pending queue.

### H. Timetable

- Common: class timetable, section timetable, teacher timetable, subject assignment, weekday/time slots.
- Premium: Teacher Conflict Detection, Class Free Period Warning, Room/Resource Conflict Future-Ready, Substitute Teacher Planning, Student/Parent Weekly View, Teacher Daily Agenda.
- P0: timetable preview widgets where real data exists.
- P1: create/list timetable by class/section/teacher.
- P2: conflict detection and substitutions.
- Data: TimetableSlot, class/section/subject/teacher assignments, optional room/resource.
- Pages: builder, class timetable, teacher timetable, student/parent weekly view.
- Widgets: today's classes, next class, free periods, conflicts.
- Empty: timetable not published.
- Permissions: role-scoped timetable only.
- Do not fake: today's classes, conflicts, room availability.

### I. Exams / Results

- Common: exam setup, schedule, marks entry, grading, result publish, report card, student/parent result view.
- Premium: Student Improvement Plan, Weak Subject Detection, Class/Subject Performance Analytics, Teacher Result Notes, Parent Result Acknowledgement, Publish Approval Workflow.
- P0: upcoming exams and latest results widgets.
- P1: schedule, marks entry, publish, report card.
- P2: improvement plans, weak subject detection, acknowledgement analytics.
- Data: Exam, Schedule, Marks, GradeScale, ResultPublishStatus, ReportCard, TeacherNote, ParentAcknowledgement.
- Pages: exam dashboard, schedule, marks, publish, student result, parent result.
- Widgets: upcoming exams, marks pending, latest result, weak subjects, publish status.
- Empty: no exams, no results, no marks.
- Permissions: teachers enter assigned marks; students/parents see published own/linked child results.
- Do not fake: grades, summaries, weak alerts.

### J. Fees / Finance

- Common: categories, structures, invoices, payments, paid/unpaid/partial/overdue, receipts, history, class-wise dues, ledger, daily/monthly collection, reports.
- Premium: Fee Risk Dashboard, Repeated Late Payment Alerts, Expected vs Collected Revenue, Concession/Scholarship Workflow, Dues Reminder Queue, Parent Payment Timeline, Class-wise Collection Heatmap, Audit-Friendly History.
- P0: real fee dashboard preview if records exist, parent fee due card if linked.
- P1: structures, invoices, payments, receipts, dues.
- P2: risk dashboard, concessions, heatmaps.
- Data: FeeCategory, FeeStructure, FeeInvoice/FeeRecord, Payment, Receipt, Discount, Scholarship, Ledger, Reminder.
- Pages: finance dashboard, setup, invoices, payments, receipts, ledger, reports, parent fee view.
- Widgets: due, paid, partial, overdue, daily/monthly collection, expected vs collected, class dues.
- Empty: no fee structure, no invoices, no payments.
- Permissions: Finance sees assigned school finance; parent sees linked child fees.
- Do not fake: money totals, payment status, receipts.

### K. Library

- Common: catalog, categories, ISBN, author/publisher, copies, shelf/location, issue/return, due date, overdue, fines, damaged/lost, borrowers, history, reports.
- Premium: Reading Program Manager, Parent/Student Request Queue, Recommendations, Class/Age Reading Lists, Challenges, Badges, Low Circulation, Most Read, Overdue Risk, Purchase/Add Requests.
- P0: library summary and book count if data exists.
- P1: catalog, copies, issue/return, overdue, history.
- P2: reading program, requests, challenges, badges, purchase queue.
- Data: LibraryBook, BookCopy, LibraryIssue, LibraryReturn, LibraryFine, BorrowerProfile, BookRequest, ReadingList, ReadingLog, Challenge, Badge.
- Pages: dashboard, catalog, book detail, issue/return, overdue, borrowers, requests, lists, challenges, reports.
- Widgets: total books, available copies, issued, overdue, requests, most read, challenge progress.
- Empty: no books, no copies, no requests.
- Permissions: Librarian sees assigned school library; parent/student requests own/linked child.
- Do not fake: availability, due dates, overdue, fines, most read, badges.

### L. Reading Program

- Common: reading lists, logs, history, recommendations.
- Premium: Parent-driven recommendations, class challenges, age-wise lists, Reading Culture Dashboard, Top Readers, Parent Participation Score, Request-to-Purchase Pipeline.
- P0: only real reading progress if data exists.
- P1: reading lists and logs.
- P2: badges, challenges, parent participation, request-to-purchase.
- Data: ReadingList, ReadingRecommendation, ReadingLog, ReadingChallenge, ReadingBadge, BookRequest, ParentConfirmation.
- Pages: reading dashboard, lists, log, parent confirmation, librarian manager, challenges, badges.
- Widgets: progress, books completed, active challenge, recommendations, badges.
- Empty: no reading list, no logs.
- Permissions: students own; parents linked child; librarian/admin class/school analytics.
- Do not fake: progress, badges, top readers.

### M. LMS

- Common: lessons, materials, assignments, submissions, feedback, progress, parent visibility.
- Premium: Progress Heatmap, Weak Topic Suggestions, Parent Learning View, Lesson Goals, Assignment Risk Alerts, Learning Timeline, Teacher Content Activity Score.
- P0: LMS progress card if real; assignment widgets.
- P1: lessons, materials, assignments, submissions, feedback.
- P2: heatmaps, weak topics, activity scores.
- Data: Course, Lesson, Material, Assignment, Submission, Feedback, Completion, Progress, TopicMap.
- Pages: LMS dashboard, courses, lessons, materials, assignments, submissions, progress, parent view.
- Widgets: progress, pending assignments, submissions due, weak topics, content activity.
- Empty: no courses, assignments, submissions.
- Permissions: teachers assigned courses; students enrolled courses; parents linked child.
- Do not fake: completion, submissions, feedback, weak topics.

### N. Notices / Communication

- Common: notice creation, audience targeting, teachers/students/parents, class/section targeting, publish/archive, calendar/events.
- Premium: Notice Read Analytics, Parent Acknowledgement, Teacher-Parent Message Center, PTM Request, Complaint/Feedback, Provider Not Configured State, Communication Timeline per Student.
- P0: real notices panel and targeted listing.
- P1: messages, PTM, acknowledgement tracking.
- P2: communication timeline, complaint analytics, provider sending.
- Data: Notice, AudienceTarget, ReadReceipt, Acknowledgement, MessageThread, PTMRequest, Complaint, ProviderConfig.
- Pages: notices, create, inbox/messages, PTM, feedback, provider settings.
- Widgets: unread notices, acknowledgements pending, messages, PTM requests, complaints.
- Empty: no notices, no messages, provider not configured.
- Permissions: users see relevant notices; messages scoped by teacher/student/parent relation.
- Do not fake: read counts, acknowledgements, SMS/email delivery.

### O. Reports

- Common: school summary, admission, student, teacher, attendance, exam, fee, library, LMS reports.
- Premium: Class Health, Student Growth, Parent Engagement, Teacher Workload, Reading Culture, Fee Risk, Attendance Risk, School Health Score reports.
- P0: dashboard summaries only, real data.
- P1: exportable operational reports.
- P2: health scores and risk reports.
- Data: aggregations from all modules filtered by schoolId and permissions.
- Pages: reports hub, module reports, filters, export.
- Widgets: report availability, recent reports, risk summaries.
- Empty: no data for selected report.
- Permissions: role-specific reports only.
- Do not fake: PDF exports, analytics, risk reports.

### P. Documents / Forms

- Common: document vault, student documents, admission forms, consent forms, certificates, ID card data.
- Premium: Missing Document Alerts, Parent Upload Requests, Approval Workflow, Expiry Reminders.
- P0: admission document requirements if configured.
- P1: student vault and upload/review.
- P2: expiry alerts, e-sign, certificates.
- Data: DocumentType, DocumentRecord, FileMetadata, Owner, ApprovalStatus, Expiry, UploadSource.
- Pages: documents hub, student docs, admission docs, parent uploads, approvals.
- Widgets: missing documents, pending review, expiring soon.
- Empty: no document types configured.
- Permissions: parent linked child only; staff permitted categories.
- Do not fake: files, approvals, expiry.

### Q. Health / Emergency Profile

- Common: health profile, allergies, emergency contacts, doctor, medical documents, consent forms, parent permissions.
- Premium: Emergency Quick Card, Medical Attachment Flag, Parent Update Request, Staff Access Audit.
- P0: not required unless school requests.
- P1: emergency contacts and basic health profile.
- P2: consent workflows, documents, access audit.
- Data: HealthProfile, Allergy, EmergencyContact, Doctor, Consent, MedicalDocument.
- Pages: health profile, emergency contacts, parent update, staff emergency view.
- Widgets: missing contacts, medical flags.
- Empty: no emergency contact.
- Permissions: strict school/role scope; audit sensitive access.
- Do not fake: medical data, contacts, consent.

### R. Discipline / Behavior Notes

- Common: behavior notes, incidents, teacher comments, parent visibility when allowed.
- Premium: Positive Behavior Notes, Improvement Timeline, Parent Acknowledgement, Repeated Incident Alerts.
- P0: not required.
- P1: teacher notes and admin review.
- P2: risk alerts and acknowledgement.
- Data: BehaviorNote, Incident, Severity, Visibility, Reviewer, ParentAcknowledgement.
- Pages: behavior notes, incident detail, student timeline.
- Widgets: open incidents, repeated incidents, positive notes.
- Empty: no notes recorded.
- Permissions: teachers assigned students; parents only approved visible notes.
- Do not fake: incidents, severity, acknowledgement.

### S. Staff Tasks / Approvals

- Common: task lists, approvals, review queues, reminders.
- Premium: Unified Approval Inbox, SLA/ageing, Role-Routed Approvals, Comments/Timeline.
- P0: Today's Action Queue preview from real pending items.
- P1: leave, admission, concession, result publish approvals.
- P2: SLA analytics and workflow builder.
- Data: ApprovalRequest, Task, Assignee, Status, Comment, Timeline, LinkedEntity.
- Pages: approval inbox, task detail, reviewer queue.
- Widgets: pending approvals, overdue approvals, by-module queue.
- Empty: no pending approvals.
- Permissions: assigned/authorized reviewers only.
- Do not fake: approval counts, timelines, decisions.

### T. Analytics / Risk Alerts

- Common: operational reports and dashboards.
- Premium: School Health Score, Attendance Risk, Fee Risk, Student Growth Risk, Parent Engagement Risk, Reading Culture Score, Teacher Workload Risk, Class Health Report.
- P0: real dashboard analytics with empty states.
- P1: attendance and fee risk queues.
- P2: predictive/weighted scores, trend history, recommendations.
- Data: historical attendance, fees, exams, LMS, read receipts, messages, library, reading logs, approvals, audit logs.
- Pages: analytics hub, risk alerts, class health, school health, reports.
- Widgets: risks, health score, trends, class comparison, at-risk students.
- Empty: not enough data to calculate; show prerequisites.
- Permissions: admin/principal school-wide; teachers assigned; parents/students own/linked child.
- Do not fake: scores, predictions, alerts, rankings, engagement.
