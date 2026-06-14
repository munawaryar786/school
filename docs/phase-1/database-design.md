# Database Design

Project: School ERP Management System  
Phase: 1 - System Architecture

## Database Strategy

- PostgreSQL is the system of record.
- Prisma ORM manages schema, migrations, typed queries, and transactions.
- A shared database with tenant-scoped rows is the baseline multi-school strategy.
- Every school-owned record includes `schoolId`.
- Platform-level records have `schoolId = null` only when intentionally global.
- All high-risk writes run inside transactions and create audit events.
- Soft deletion is used for business records that must remain auditable.

## Global Conventions

| Convention | Requirement |
| --- | --- |
| Primary keys | `String @id @default(cuid())` or UUID equivalent, decided in Phase 2 implementation |
| Timestamps | `createdAt`, `updatedAt`, optional `deletedAt` |
| Tenant field | `schoolId` for all school-scoped models |
| Actor fields | `createdById`, `updatedById` where auditability matters |
| Status fields | Use enums for workflow states |
| Money fields | Store as integer minor units plus currency |
| File references | Store metadata in database, binary in S3-compatible storage |
| Audit logs | Append-only, not editable by normal users |
| Indexing | Index `schoolId`, foreign keys, unique business identifiers, search fields, and report filters |

## Core Entity Groups

### Identity and Access

| Model | Purpose | Scope |
| --- | --- | --- |
| User | Login identity across platform and schools | Global identity, linked to memberships |
| UserProfile | Person-level profile details | Global |
| SchoolMembership | Connects user to school, role, status | School-scoped |
| Role | Role definitions such as Super Admin, School Admin, Teacher, Student, Parent | Global/system plus school-customizable later |
| Permission | Atomic permission keys | Global |
| RolePermission | Role-to-permission mapping | Global/school |
| Session | Refresh/session tracking and revocation | Global |
| TwoFactorMethod | TOTP/recovery configuration | User-scoped |
| Invitation | Invite flow for admins, teachers, parents, staff | School-scoped where applicable |
| PasswordResetToken | Password reset flow | Global |

### Tenancy and Platform

| Model | Purpose | Scope |
| --- | --- | --- |
| School | Tenant record and institutional profile | Platform |
| Campus | Optional physical campus under a school | School-scoped |
| SubscriptionPlan | Platform billing plan | Platform |
| Subscription | School subscription state | School-scoped |
| SchoolSetting | Tenant-level settings | School-scoped |
| SystemSetting | Platform-level settings | Platform |
| AuditLog | Security and activity trail | Platform and school-scoped |
| BackupJob | Backup/restore tracking | Platform and school-scoped |

### Academic Core

| Model | Purpose | Scope |
| --- | --- | --- |
| AcademicYear | School academic year | School-scoped |
| Term | Academic terms/semesters | School-scoped |
| ClassLevel | Class or grade level | School-scoped |
| Section | Section within a class | School-scoped |
| Subject | Subject catalog | School-scoped |
| ClassSubject | Subject assigned to class/section | School-scoped |
| Curriculum | Curriculum plan/version | School-scoped |
| Timetable | Timetable header | School-scoped |
| TimetableSlot | Scheduled class period | School-scoped |

### People

| Model | Purpose | Scope |
| --- | --- | --- |
| Student | Student profile | School-scoped |
| StudentEnrollment | Student academic placement per year/class/section | School-scoped |
| Guardian | Parent/guardian profile | School-scoped |
| StudentGuardian | Student-to-guardian relationship | School-scoped |
| Teacher | Teacher profile | School-scoped |
| Staff | Non-teaching staff profile | School-scoped |
| Employee | HR employee master record | School-scoped |
| TeacherAssignment | Teacher assigned to class/subject/section | School-scoped |

### Admissions

| Model | Purpose | Scope |
| --- | --- | --- |
| AdmissionApplication | Applicant record and lifecycle | School-scoped |
| AdmissionDocument | Uploaded applicant documents | School-scoped |
| AdmissionDecision | Approval/rejection/waitlist decision | School-scoped |
| EnrollmentConversion | Application-to-student conversion trail | School-scoped |

### Attendance

| Model | Purpose | Scope |
| --- | --- | --- |
| StudentAttendance | Daily/period student attendance | School-scoped |
| TeacherAttendance | Teacher attendance | School-scoped |
| StaffAttendance | Staff attendance | School-scoped |
| AttendanceCorrection | Corrections and approvals | School-scoped |
| AttendanceNotification | Sent notification tracking | School-scoped |

### Examination

| Model | Purpose | Scope |
| --- | --- | --- |
| Exam | Exam definition | School-scoped |
| ExamSchedule | Exam timing and class/subject schedule | School-scoped |
| QuestionBank | Question collection | School-scoped |
| Question | Individual question | School-scoped |
| OnlineExamAttempt | Student online exam attempt | School-scoped |
| MarkEntry | Marks per student/subject/exam | School-scoped |
| Result | Published result summary | School-scoped |
| ReportCard | Generated report card metadata | School-scoped |

### LMS

| Model | Purpose | Scope |
| --- | --- | --- |
| Course | Course definition | School-scoped |
| CourseEnrollment | Student enrollment in course | School-scoped |
| Material | File/video/link material | School-scoped |
| Assignment | Assignment metadata | School-scoped |
| AssignmentSubmission | Student submission | School-scoped |
| Quiz | Quiz definition | School-scoped |
| QuizAttempt | Quiz attempt and score | School-scoped |
| ProgressRecord | Student learning progress | School-scoped |

### Finance

| Model | Purpose | Scope |
| --- | --- | --- |
| FeeType | Fee categories | School-scoped |
| FeeStructure | Fee configuration by class/period | School-scoped |
| Invoice | Student invoice | School-scoped |
| InvoiceLine | Invoice line item | School-scoped |
| Payment | Payment record | School-scoped |
| PaymentAllocation | Allocation to invoice lines | School-scoped |
| Scholarship | Scholarship definition | School-scoped |
| Discount | Discount definition/application | School-scoped |
| LedgerAccount | Chart of accounts entry | School-scoped |
| JournalEntry | Accounting journal header | School-scoped |
| JournalLine | Accounting journal line | School-scoped |
| Expense | Expense record | School-scoped |
| Budget | Budget plan | School-scoped |

### Operations

| Model | Purpose | Scope |
| --- | --- | --- |
| Book | Library title | School-scoped |
| BookCopy | Physical copy/accession | School-scoped |
| LibraryIssue | Book issue/return workflow | School-scoped |
| LibraryFine | Fine tracking | School-scoped |
| Document | Uploaded document metadata | School-scoped |
| CertificateTemplate | Certificate layout metadata | School-scoped |
| Certificate | Generated certificate | School-scoped |
| Transcript | Generated transcript | School-scoped |
| VerificationToken | Public verification token | School-scoped |
| Meeting | Meeting schedule | School-scoped |
| MeetingMinute | Meeting minutes | School-scoped |
| CmsPage | Website page | School-scoped |
| CmsPost | Blog/news/announcement post | School-scoped |
| CmsMedia | Public media metadata | School-scoped |

### Communication

| Model | Purpose | Scope |
| --- | --- | --- |
| MessageThread | Conversations | School-scoped |
| Message | Message content | School-scoped |
| Announcement | Broadcast announcements | School-scoped |
| NotificationTemplate | SMS/email/push templates | School-scoped |
| Notification | Notification record | School-scoped |
| NotificationDelivery | Provider delivery status | School-scoped |

### Reporting and Jobs

| Model | Purpose | Scope |
| --- | --- | --- |
| ReportRequest | Async report request | School-scoped |
| ExportJob | PDF/Excel export job | School-scoped |
| ImportJob | Future import tracking | School-scoped |
| BackgroundJobLog | Worker job status | Platform/school |

## Key Relationships

| Relationship | Cardinality |
| --- | --- |
| School to Campus | One-to-many |
| School to SchoolMembership | One-to-many |
| User to SchoolMembership | One-to-many |
| School to AcademicYear | One-to-many |
| AcademicYear to Term | One-to-many |
| ClassLevel to Section | One-to-many |
| Student to StudentEnrollment | One-to-many |
| Student to Guardian | Many-to-many through StudentGuardian |
| Teacher to ClassSubject | Many-to-many through TeacherAssignment |
| Exam to ExamSchedule | One-to-many |
| Invoice to InvoiceLine | One-to-many |
| Payment to PaymentAllocation | One-to-many |
| Book to BookCopy | One-to-many |
| CertificateTemplate to Certificate | One-to-many |

## Tenant Isolation Rules

| Rule | Requirement |
| --- | --- |
| Query scoping | API services must include `schoolId` in every school-scoped read/write. |
| Unique constraints | Business identifiers are unique within `schoolId`, not globally, unless platform-level. |
| Super Admin access | Super Admin can view/manage tenants through platform APIs with explicit audit logging. |
| Cross-school membership | A user may belong to multiple schools, but each request has exactly one active school context. |
| Public CMS | Public pages resolve school context by configured domain/subdomain before loading content. |

## Migration Strategy

- Phase 2 creates foundation schema only.
- Each feature phase adds migrations for its module.
- Migrations must include indexes and constraints with the feature, not later.
- Seed data is limited to required system roles, permissions, and development-safe test accounts where approved.

