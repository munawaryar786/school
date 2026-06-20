# Phase 32 Parent + Student Engagement Spec

Date: 2026-06-20
Scope: Documentation/specification only. No implementation changes.

## Product Goal

Parent and Student portals should become a premium engagement hub, not just a place to view records. Parents need confidence and action. Students need clarity, progress, and motivation. Every view must be scoped: student sees own data; parent sees linked child/children only.

## Core Experiences

### 1. Parent Child Selector

- Parent dashboard starts with child selector when more than one linked child exists.
- Child card shows name, class, section, admission number, photo/avatar, attendance snapshot, fees due, homework count, next exam, library due status.
- If no linked children exist, show: `No child profile is linked to your account. Contact school administration.`

Later data models:
- `GuardianStudentLink`, `StudentProfile`, `ParentProfile`, `User`, `ClassLevel`, `Section`.

Later API routes:
- `GET /v1/parents/children`
- `GET /v1/parents/children/:studentId/summary`

Priority: P0.

### 2. Attendance View

- Parent sees attendance calendar and monthly percentage per linked child.
- Student sees own attendance percentage, absences, late marks, excused leaves.
- Teacher-approved/School-admin-approved leave should appear as `Excused`.

Models later:
- `AttendanceRecord`, `LeaveRequest`, `AcademicCalendar`.

Routes later:
- `GET /v1/parents/children/:studentId/attendance`
- `GET /v1/students/me/attendance`

Dashboard cards:
- Attendance percentage, absences this month, late arrivals, excused leaves.

Empty state:
- `Attendance has not been marked for this period.`

Priority: P0/P1 depending on attendance implementation.

### 3. Parent Leave Request Workflow

Full workflow:
1. Parent selects child.
2. Parent chooses date range.
3. Parent selects leave type: Sick leave, Family leave, Emergency leave, Appointment, Other.
4. Parent enters reason.
5. Parent optionally uploads attachment/document.
6. Request is submitted.
7. Class teacher or School Admin reviews.
8. Reviewer can approve, reject, or request clarification.
9. Parent sees timeline: submitted, under review, approved/rejected, comment.
10. Approved leave links to attendance.
11. Teacher sees approved leave while marking attendance.
12. Attendance can mark student as excused.
13. School Admin sees leave analytics.

Premium differentiators:
- Leave calendar.
- Repeated leave pattern alert.
- Medical attachment flag.
- Teacher-visible leave indicator.
- Parent notification.
- Attendance integration.

Models later:
- `LeaveRequest`, `LeaveRequestAttachment`, `LeaveRequestTimeline`, `AttendanceRecord`, `Notification`, `GuardianStudentLink`.

Routes later:
- `POST /v1/parents/children/:studentId/leave-requests`
- `GET /v1/parents/children/:studentId/leave-requests`
- `GET /v1/school-admin/leave-requests`
- `PATCH /v1/school-admin/leave-requests/:id/review`
- `GET /v1/teachers/leave-context?classId=&sectionId=&date=`

Pages needed:
- Parent leave request form.
- Parent leave request timeline.
- Teacher attendance marking with leave indicator.
- School Admin leave review queue.
- Leave analytics.

Notification points:
- Submitted to reviewer.
- Approved/rejected/request clarification to parent.
- Approved leave visible to teacher.

Launch priority:
- P1 for paid school pilot.
- P2 for pattern analytics.

What not to fake:
- Approval status, reviewer comment, attachments, attendance linkage, repeated leave alert.

### 4. Homework / Assignment Visibility

- Student sees assigned homework/assignments with due dates, status, submission state.
- Parent sees linked child pending/completed/missed work.
- Teacher feedback is visible after publication.

Models later:
- `Homework`, `Assignment`, `Submission`, `TeacherFeedback`, `ClassSectionAssignment`.

Routes later:
- `GET /v1/students/me/assignments`
- `GET /v1/parents/children/:studentId/assignments`

Dashboard cards:
- Due today, overdue, submitted, teacher feedback.

Priority: P0/P1.

### 5. Exam / Result Visibility

- Student sees exam schedule and published results only.
- Parent sees linked child exam schedule, latest results, report cards.
- Draft/unpublished marks must never leak.

Models later:
- `Exam`, `ExamSchedule`, `Marks`, `Result`, `ReportCard`, `ResultPublishStatus`, `ParentAcknowledgement`.

Routes later:
- `GET /v1/students/me/exams`
- `GET /v1/students/me/results`
- `GET /v1/parents/children/:studentId/results`
- `POST /v1/parents/children/:studentId/results/:resultId/acknowledge`

Dashboard cards:
- Upcoming exam, latest result, weak subject if real, result acknowledgement pending.

Priority: P0 for schedule/latest result widgets, P1 for full results, P2 for acknowledgement.

### 6. Fee Status

- Parent sees fee invoices/status/payment history for linked child.
- Student may see fee status only if school enables student visibility.
- Finance owns payment records.

Models later:
- `FeeInvoice`, `FeeRecord`, `Payment`, `Receipt`, `StudentLedger`.

Routes later:
- `GET /v1/parents/children/:studentId/fees`
- `GET /v1/students/me/fees` if enabled.

Dashboard cards:
- Total due, overdue, next due date, last payment.

Priority: P1.

### 7. Notices

- Parent/student notices must be audience-targeted.
- Notices can require acknowledgement.
- Read tracking must use real read receipts.

Models later:
- `Notice`, `NoticeAudience`, `NoticeReadReceipt`, `NoticeAcknowledgement`.

Routes later:
- `GET /v1/parents/notices`
- `GET /v1/students/me/notices`
- `POST /v1/parents/notices/:id/read`
- `POST /v1/parents/notices/:id/acknowledge`

Dashboard cards:
- Unread notices, acknowledgement required.

Priority: P0/P1.

### 8. Teacher Messages

- Parent can message class teacher or subject teacher where enabled.
- Teacher sees only messages for assigned classes/students.
- School Admin can audit/moderate if policy requires.

Models later:
- `MessageThread`, `MessageParticipant`, `Message`, `TeacherAssignment`, `GuardianStudentLink`.

Routes later:
- `GET /v1/parents/messages`
- `POST /v1/parents/children/:studentId/messages`
- `GET /v1/teachers/messages`

Dashboard cards:
- Recent teacher messages, unread replies.

Priority: P1.

### 9. PTM Request

- Parent requests meeting with teacher/admin.
- Teacher/admin proposes/approves time.
- Timeline shows requested, accepted, rescheduled, completed.

Models later:
- `PtmRequest`, `PtmSlot`, `PtmTimeline`.

Routes later:
- `POST /v1/parents/children/:studentId/ptm-requests`
- `GET /v1/teachers/ptm-requests`
- `PATCH /v1/teachers/ptm-requests/:id`

Priority: P1.

### 10. Complaint / Feedback

- Parent submits complaint/feedback category, student optional, note, attachment optional.
- School Admin triages, assigns, resolves.
- Parent sees status timeline.

Models later:
- `ParentFeedback`, `FeedbackAttachment`, `FeedbackTimeline`.

Priority: P2.

### 11. Library Issued Books and Overdue Books

- Student/parent see issued books, due dates, overdue status, fines if enabled.
- Alerts appear in dashboard and reading hub.

Models later:
- `LibraryIssue`, `LibraryReturn`, `LibraryFine`, `BookCopy`.

Routes later:
- `GET /v1/students/me/library/issues`
- `GET /v1/parents/children/:studentId/library/issues`

Priority: P1.

### 12. Reading Recommendations

- Librarian/teacher creates age-wise/class-wise reading lists.
- Student sees recommended reading.
- Parent sees reading list for linked child.

Models later:
- `ReadingList`, `ReadingListItem`, `ReadingRecommendation`.

Priority: P2.

### 13. Book Reservation

- Student/parent can reserve available book.
- Librarian approves/fulfills or rejects.
- Queue respects availability.

Models later:
- `BookReservation`, `BookCopy`, `LibraryBook`.

Priority: P2.

### 14. Request Librarian To Add Book

Workflow:
1. Parent selects child.
2. Parent enters title, author if known, reason/request note, child interest category.
3. Librarian receives request queue.
4. Librarian approves, rejects, or asks clarification.
5. Approved request can reserve an existing book or enter purchase/addition queue.

Models later:
- `BookRequest`, `BookRequestTimeline`, `BookPurchaseQueue`, `InterestCategory`.

Priority: P2 advanced differentiator.

### 15. Reading Log Upload / Confirmation

- Student logs reading minutes/pages/books.
- Parent can confirm home reading.
- Teacher/librarian can review if required.

Models later:
- `ReadingLog`, `ReadingLogConfirmation`, `ReadingAttachment`.

Priority: P2.

### 16. Student Reading Badges

- Badges are earned from real reading logs, challenges, or librarian-approved milestones.
- Never manually show fake badges without criteria.

Models later:
- `ReadingBadge`, `StudentReadingBadge`, `ReadingChallenge`.

Priority: P2.

### 17. Parent Engagement Analytics

- Score can include notice reads, acknowledgements, PTM participation, leave requests, reading confirmations, message responsiveness.
- Only calculate when enough real data exists.

Models later:
- Aggregates from notices, messages, PTM, leave, reading, feedback.

Priority: P2.

### 18. Student Growth Timeline

- Student/parent timeline merges attendance milestones, results, assignments, reading, LMS progress, behavior/positive notes.
- Privacy rules control what each actor sees.

Priority: P2.

## Privacy Rules

- Parent cannot access any child not linked through verified guardian link.
- Student cannot access siblings or classmates' private records.
- Draft results, private behavior notes, medical data, and internal admin comments require strict visibility rules.
- Sensitive accesses should be auditable.

## Launch Priority Summary

P0:
- Parent child selector, student dashboard, attendance/result/homework/notices cards with real data.

P1:
- Parent leave request, PTM request, fees/payment history, teacher messages, library issued books, health/emergency basics.

P2:
- Reading requests, book reservations, add-book request, reading logs, reading badges, engagement analytics, growth timeline, complaint analytics.
